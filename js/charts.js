// ==================== CHARTS MODULE ====================
// Handles all chart rendering and visualization

const Charts = (() => {
    let charts = {};

    // Initialize charts
    function init() {
        setupCharts();
    }

    // Setup all charts
    function setupCharts() {
        // Initialize empty chart objects
        charts.production = null;
        charts.animals = null;
        charts.productionTrend = null;
        charts.monthlyProduction = null;
        charts.healthStatus = null;
        charts.vaccinationCoverage = null;
        charts.dewormingSchedule = null;
    }

    // Update dashboard charts
    function updateDashboardCharts() {
        updateProductionChart();
    }

    // Production Chart (Weekly)
    function updateProductionChart() {
        const ctx = document.getElementById('productionChart');
        if (!ctx) return;

        const last7Days = getLast7DaysData();
        
        if (charts.production) {
            charts.production.destroy();
        }

        charts.production = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.labels,
                datasets: [{
                    label: 'Milk Production (Liters)',
                    data: last7Days.data,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2ecc71',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Liters'
                        }
                    }
                }
            }
        });
    }

    // Animal Distribution Chart
    function updateAnimalDistributionChart() {
        const ctx = document.getElementById('animalChart');
        if (!ctx) return;

        const animals = Animals.getAll();
        const distribution = {
            cow: animals.filter(a => a.type === 'cow').length,
            sheep: animals.filter(a => a.type === 'sheep').length,
            goat: animals.filter(a => a.type === 'goat').length
        };

        if (charts.animals) {
            charts.animals.destroy();
        }

        charts.animals = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['🐄 Cows', '🐑 Sheep', '🐐 Goats'],
                datasets: [{
                    data: [distribution.cow, distribution.sheep, distribution.goat],
                    backgroundColor: [
                        '#3498db',
                        '#e74c3c',
                        '#f39c12'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Production Trend Chart (from production tab)
    function updateProductionTrendChart() {
        const ctx = document.getElementById('productionTrendChart');
        if (!ctx) return;

        const last30Days = getLast30DaysData();

        if (charts.productionTrend) {
            charts.productionTrend.destroy();
        }

        charts.productionTrend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last30Days.labels,
                datasets: [{
                    label: 'Daily Milk (Liters)',
                    data: last30Days.data,
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Monthly Production Chart (from reports tab)
    function updateMonthlyProductionChart() {
        const ctx = document.getElementById('monthlyProductionChart');
        if (!ctx) return;

        const monthlyData = getMonthlyData();

        if (charts.monthlyProduction) {
            charts.monthlyProduction.destroy();
        }

        charts.monthlyProduction = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Monthly Production',
                    data: monthlyData.data,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Vaccination Coverage Chart
    function updateVaccinationCoverageChart() {
        const ctx = document.getElementById('vaccinationCoverageChart');
        if (!ctx) return;

        const animals = Animals.getActive();
        const vaccinations = Vaccinations.getAll();

        // Count animals with at least one vaccination
        const animalsWithVaccines = new Set();
        vaccinations.forEach(v => {
            animalsWithVaccines.add(v.animalId);
        });

        const coverage = {
            vaccinated: animalsWithVaccines.size,
            notVaccinated: animals.length - animalsWithVaccines.size
        };

        if (charts.vaccinationCoverage) {
            charts.vaccinationCoverage.destroy();
        }

        charts.vaccinationCoverage = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Vaccinated', 'Not Vaccinated'],
                datasets: [{
                    data: [coverage.vaccinated, coverage.notVaccinated],
                    backgroundColor: [
                        '#2ecc71',
                        '#e74c3c'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Deworming Schedule Chart
    function updateDewormingScheduleChart() {
        const ctx = document.getElementById('dewormingScheduleChart');
        if (!ctx) return;

        const deworming = Deworming.getAll();
        const today = new Date();

        const overdue = deworming.filter(d => d.nextDueDate && isOverdue(d.nextDueDate)).length;
        const dueSoon = deworming.filter(d => d.nextDueDate && isDueSoon(d.nextDueDate) && !isOverdue(d.nextDueDate)).length;
        const current = deworming.filter(d => d.nextDueDate && !isOverdue(d.nextDueDate) && !isDueSoon(d.nextDueDate)).length;

        if (charts.dewormingSchedule) {
            charts.dewormingSchedule.destroy();
        }

        charts.dewormingSchedule = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Overdue', 'Due Soon', 'Current'],
                datasets: [{
                    label: 'Deworming Status',
                    data: [overdue, dueSoon, current],
                    backgroundColor: [
                        '#e74c3c',
                        '#f39c12',
                        '#2ecc71'
                    ],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Helper function to get last 7 days data
    function getLast7DaysData() {
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = getDateString(date);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const total = Production.getTotalByDate(dateStr);
            data.push(total);
        }

        return { labels, data };
    }

    // Helper function to get last 30 days data
    function getLast30DaysData() {
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = getDateString(date);
            
            if (i % 5 === 0) { // Show every 5th label
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            } else {
                labels.push('');
            }
            
            const total = Production.getTotalByDate(dateStr);
            data.push(total);
        }

        return { labels, data };
    }

    // Helper function to get monthly data (last 12 months)
    function getMonthlyData() {
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));

            // Calculate total for the month
            const startDate = new Date(date);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const monthTotal = Production.getByDateRange(getDateString(startDate), getDateString(endDate))
                .reduce((sum, p) => sum + p.total, 0);
            data.push(monthTotal);
        }

        return { labels, data };
    }

    // Update all charts
    function updateAll() {
        updateDashboardCharts();
        updateProductionTrendChart();
        updateMonthlyProductionChart();
        updateVaccinationCoverageChart();
        updateDewormingScheduleChart();
    }

    // Public API
    return {
        init,
        updateDashboardCharts,
        updateProductionChart,
        updateAnimalDistributionChart,
        updateProductionTrendChart,
        updateMonthlyProductionChart,
        updateVaccinationCoverageChart,
        updateDewormingScheduleChart,
        updateAll
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Charts.init();
});
