// ==================== DATA MANAGEMENT MODULE ====================

const DataManagement = (function() {
    let selectedFile = null;

    function init() {
        const fileInput = document.getElementById('excel-file-input');
        const chooseBtn = document.getElementById('choose-file-btn');
        const processBtn = document.getElementById('process-import-btn');
        const fileNameDisplay = document.getElementById('selected-file-name');
        const exportBtn = document.getElementById('full-export-btn');

        if (chooseBtn && fileInput) {
            chooseBtn.addEventListener('click', () => fileInput.click());
            
            fileInput.addEventListener('change', (e) => {
                selectedFile = e.target.files[0];
                if (selectedFile) {
                    fileNameDisplay.textContent = selectedFile.name;
                    processBtn.disabled = false;
                } else {
                    fileNameDisplay.textContent = 'No file chosen';
                    processBtn.disabled = true;
                }
            });
        }

        if (processBtn) {
            processBtn.addEventListener('click', handleImport);
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', handleExport);
        }
    }

    async function handleImport() {
        if (!selectedFile) return;

        const logContainer = document.getElementById('import-log-container');
        const logs = document.getElementById('import-logs');
        const processBtn = document.getElementById('process-import-btn');

        logContainer.classList.remove('hidden');
        logs.innerHTML = '<div class="log-entry">🚀 Starting import process...</div>';
        processBtn.disabled = true;

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    
                    // Convert to raw array of arrays
                    const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    
                    addLog('Reading spreadsheet structure...', 'info');
                    
                    // We'll use a simplified version of the logic used in final_import.py
                    // but adapted for browser-side processing
                    await processExcelRows(rows);
                    
                    addLog('✅ Import completed successfully!', 'success');
                    showNotification('Import successful!', 'success');
                    setTimeout(() => window.location.reload(), 3000);
                } catch (err) {
                    addLog('❌ Error parsing Excel: ' + err.message, 'error');
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        } catch (error) {
            addLog('❌ File read error: ' + error.message, 'error');
            processBtn.disabled = false;
        }
    }

    async function processExcelRows(rows) {
        // Find animal names and sections based on the structure we saw earlier
        // Row 1 (Index 1) typically has animal names
        const animalNamesRow = rows[1] || [];
        const animalMapping = {
            "JUNE": 2,
            "MAUREEN": 6,
            "SOFIA": 10,
            "CAREN": 14,
            "ZIPPORA": 18
        };

        const animalIds = {};
        
        // 1. Create/Update Animals
        for (const [name, col] of Object.entries(animalMapping)) {
            const aId = `animal_${name.toLowerCase()}`;
            animalIds[name] = aId;
            
            addLog(`Creating/Updating animal: ${name}...`);
            await db.collection('animals').doc(aId).set({
                id: aId,
                name: name,
                type: 'cow',
                status: 'active',
                dateAdded: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            }, { merge: true });
        }

        // 2. Parse Serving/Calving Sections (Rows 1-12 and 14-25)
        await parseSection(rows, 1, animalMapping, animalIds, "1st Serving");
        await parseSection(rows, 14, animalMapping, animalIds, "2nd Serving");

        // 3. Parse Milk Records (Header at Row 29)
        await parseMilk(rows, 29, animalIds);
    }

    async function parseSection(rows, startIdx, mapping, ids, sectionName) {
        addLog(`Processing section: ${sectionName}...`);
        
        for (const [name, col] of Object.entries(mapping)) {
            // Serving Date: Start + 2
            const servingDate = rows[startIdx + 2] ? rows[startIdx + 2][col] : null;
            const bullCode = rows[startIdx + 3] ? rows[startIdx + 3][col] : null;

            if (servingDate) {
                const bId = `breed_${name.toLowerCase()}_${startIdx}`;
                await db.collection('breeding').doc(bId).set({
                    id: bId,
                    animalId: ids[name],
                    breedingDate: formatExcelDate(servingDate),
                    sire: bullCode || 'Unknown',
                    status: 'pending',
                    notes: `Imported from ${sectionName}`,
                    createdAt: new Date().toISOString()
                }, { merge: true });
            }

            // Calving: Start + 8
            const calvingDate = rows[startIdx + 8] ? rows[startIdx + 8][col] : null;
            const calfName = rows[startIdx + 9] ? rows[startIdx + 9][col] : null;
            const calfSex = rows[startIdx + 10] ? rows[startIdx + 10][col] : null;

            if (calvingDate) {
                const hId = `health_${name.toLowerCase()}_${startIdx}`;
                await db.collection('health').doc(hId).set({
                    id: hId,
                    animalId: ids[name],
                    date: formatExcelDate(calvingDate),
                    condition: 'Calving',
                    treatment: `Delivered ${calfSex || ''} named ${calfName || 'unnamed'}`,
                    status: 'healthy',
                    notes: 'Imported from Excel',
                    createdAt: new Date().toISOString()
                }, { merge: true });
            }
        }
    }

    async function parseMilk(rows, headerIdx, ids) {
        addLog('Processing milk production records...');
        const milkMapping = {
            "JUNE": {m: 2, e: 3},
            "SOFIA": {m: 4, e: 5},
            "CAREN": {m: 6, e: 7},
            "ZIPPORA": {m: 8, e: 9}
        };

        let count = 0;
        for (let i = headerIdx + 2; i < rows.length; i++) {
            const row = rows[i];
            const dateVal = row ? row[0] : null;
            if (!dateVal) continue;

            const dateStr = formatExcelDate(dateVal);

            for (const [name, cols] of Object.entries(milkMapping)) {
                if (!ids[name]) continue;
                
                const m = parseFloat(row[cols.m]) || 0;
                const e = parseFloat(row[cols.e]) || 0;

                if (m > 0 || e > 0) {
                    const pId = `prod_${name.toLowerCase()}_${dateStr}`;
                    await db.collection('production').doc(pId).set({
                        id: pId,
                        animalId: ids[name],
                        date: dateStr,
                        morning: m,
                        evening: e,
                        afternoon: 0,
                        total: m + e,
                        createdAt: new Date().toISOString()
                    }, { merge: true });
                    count++;
                }
            }
        }
        addLog(`Imported ${count} production records.`);
    }

    function formatExcelDate(val) {
        if (!val) return null;
        if (val instanceof Date) return val.toISOString().split('T')[0];
        // Handle Excel numeric dates
        if (typeof val === 'number') {
            const date = new Date((val - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }
        return String(val).split('T')[0];
    }

    function addLog(msg, type = 'info') {
        const logs = document.getElementById('import-logs');
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logs.appendChild(div);
        logs.scrollTop = logs.scrollHeight;
    }

    async function handleExport() {
        addLog('Starting full database export...');
        try {
            const collections = ['animals', 'production', 'health', 'breeding', 'vaccinations', 'nutrition', 'deworming', 'sales', 'expenses', 'employees'];
            const exportData = {};

            for (const col of collections) {
                const snapshot = await db.collection(col).get();
                exportData[col] = snapshot.docs.map(doc => doc.data());
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `smartfarm_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            showNotification('Backup downloaded successfully!');
        } catch (err) {
            console.error('Export error:', err);
            showNotification('Export failed: ' + err.message, 'error');
        }
    }

    return { init };
})();

// Initialize if on the right tab
document.addEventListener('DOMContentLoaded', () => {
    DataManagement.init();
});
