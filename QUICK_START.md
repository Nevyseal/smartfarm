# Quick Start Guide - Smart Farm Manager

## 🚀 Get Started in 5 Minutes

### Step 1: Open the App
1. Extract the `farm-manager-app` folder
2. Open `index.html` in your web browser
3. Done! The app is ready to use

### Step 2: Add Your First Animal
1. Click "🐄 Animals" in the left sidebar
2. Click "+ Add Animal" button
3. Fill in:
   - **Animal Type**: Choose Cow, Sheep, or Goat
   - **Name/ID**: e.g., "Bessie-001"
   - **Age (Months)**: e.g., 36
   - **Weight (kg)**: e.g., 450.5
4. Click "Save Animal"
5. ✓ Your first animal is added!

### Step 3: Record Daily Milk Production
1. Click "🥛 Production" in sidebar
2. Click "+ Record Production"
3. Select your animal
4. Choose date
5. Enter milk amounts for three sessions:
   - Morning (first milking)
   - Afternoon (second milking)
   - Evening (third milking)
6. Click "Save Production"
7. ✓ Production recorded!

### Step 4: Schedule Vaccination
1. Click "💉 Vaccinations" in sidebar
2. Click "+ Add Vaccination"
3. Select animal
4. Choose vaccine type (e.g., FMD, ECF, etc.)
5. Set date vaccinated and next due date
6. Click "Save Vaccination"
7. ✓ Vaccination scheduled!

### Step 5: Track Deworming
1. Click "💊 Deworming" in sidebar
2. Click "+ Record Deworming"
3. Fill in:
   - Animal
   - Date
   - Dewormer brand
   - Amount in kg
4. Click "Save Deworming"
5. ✓ Deworming recorded!

### Step 6: View Dashboard
1. Click "📊 Dashboard" to see:
   - Total animals on farm
   - Today's milk production
   - Pending vaccinations
   - Overdue deworming

## 📊 Dashboard Overview

### Stats Cards
- **Total Animals**: Count of all animals
- **Daily Milk Prod.**: Today's total milk (liters)
- **Vaccinations Due**: Animals needing vaccination
- **Deworming Due**: Animals needing deworming

### Charts
- **Production Trend**: Weekly milk production line chart
- **Animal Distribution**: Pie chart of cow/sheep/goat counts

## 🔧 Main Features

### Animals Tab
- Add new animals (Cows, Sheep, Goats)
- Track age, weight, status
- View all animals in organized cards
- Edit or delete animals

### Vaccinations Tab
- Record all vaccine types
- Track vaccination dates
- Set next due dates
- See overdue/due soon status
- Status indicators:
  - 🟢 ✓ Current - Up to date
  - 🟡 📅 Due Soon - Within 7 days
  - 🔴 ⚠️ Overdue - Past due date

### Production Tab
- Record milk 3 times daily
- Automatic total calculation
- View averages and trends
- See monthly totals
- Production chart included

### Nutrition Tab
- Track forage (hay, silage, corn, grass)
- Record concentrates (meal, bran, pollard, molasses)
- Monitor salt usage
- View detailed nutrition history

### Deworming Tab
- Record deworming date
- Track brand and amount
- Default next due: 90 days
- See deworming status

### Reports Tab
- Monthly production trends
- Animal health status
- Vaccination coverage
- Deworming schedule overview

## 💾 Data Storage

### Automatic Save
- All data saved automatically to browser
- No internet required
- Works offline!

### Export Your Data
Press `Ctrl+E` on keyboard
- Downloads all data as JSON file
- For backup or sharing
- Date-stamped filename

### Sample Data (Testing)
- File: `sample-data.json`
- Contains example animals, vaccinations, etc.
- For testing features

## 🎯 Common Tasks

### Check What's Due
1. Click "📊 Dashboard"
2. See "Vaccinations Due" and "Deworming Due" numbers
3. Click tabs to view details

### Record Multiple Animals
1. Go to relevant tab (Production, Vaccination, etc.)
2. Click "+ Add/Record"
3. Select first animal
4. Fill details
5. Save
6. Repeat for next animal

### View Trends
1. Click "📈 Reports"
2. See charts for:
   - Monthly production
   - Vaccination coverage
   - Deworming status
   - Animal distribution

### Print Records
1. View the data you want to print
2. Press `Ctrl+S`
3. Choose printer
4. Save as PDF or print

## ❓ Frequent Questions

### Q: Will my data be lost if I close the browser?
**A**: No! Data is saved locally on your device. Your data remains even after closing the browser.

### Q: Can I use this on my phone?
**A**: Yes! The app is responsive and works on phones and tablets.

### Q: How do I use Firebase for cloud backup?
**A**: See `FIREBASE_SETUP.md` for detailed instructions.

### Q: Can I share data with others?
**A**: Yes! Use Export feature (Ctrl+E) to get JSON file you can share.

### Q: How do I back up my data?
**A**: Press `Ctrl+E` regularly to export your data as JSON file.

### Q: What if I want to delete all data?
**A**: Click "Settings" > "Logout" to clear all data.

## 🎨 Navigation Tips

### Sidebar Menu Items
| Icon | Feature | Purpose |
|------|---------|---------|
| 📊 | Dashboard | See overall farm status |
| 🐄 | Animals | Manage livestock |
| 💉 | Vaccinations | Track health records |
| 🥛 | Production | Record milk output |
| 🌾 | Nutrition | Track feed/nutrition |
| 💊 | Deworming | Schedule treatments |
| 📈 | Reports | View analytics |
| ⚙️ | Settings | Farm info & options |

### Status Indicators
- 🟢 = Active/Current/Good
- 🟡 = Warning/Due Soon
- 🔴 = Overdue/Alert
- ⚠️ = Needs Attention
- ✓ = Completed
- 📅 = Scheduled

## ⌨️ Keyboard Shortcuts

| Keys | Action |
|------|--------|
| Ctrl+S / Cmd+S | Print current page |
| Ctrl+E / Cmd+E | Export all data |

## 🚨 Troubleshooting

### App not opening
- Try a different browser (Chrome recommended)
- Clear browser cache
- Check internet connection

### Data disappeared
- Check browser settings for blocked storage
- Try incognito/private mode
- Export has your backup

### Charts not showing
- Refresh the page (F5)
- Add some data first
- Check browser console for errors

### Forms not submitting
- Fill all required fields (marked with *)
- Check browser console
- Try different browser

## 📞 Need Help?

### What to Check:
1. Browser console (F12 > Console tab)
2. Make sure all required fields are filled
3. Try refreshing the page
4. Clear browser cache
5. Try in incognito mode

### Common Issues:
- **"Permission denied"**: Try incognito mode
- **No data showing**: Add data first to see charts
- **Form won't save**: Check all required fields

## 🎓 Learning Path

### Beginner
1. ✓ Add first animal
2. ✓ Record one production entry
3. ✓ View dashboard

### Intermediate
1. ✓ Add multiple animals
2. ✓ Set up vaccination schedule
3. ✓ Record nutrition data
4. ✓ View reports

### Advanced
1. ✓ Set up Firebase cloud sync
2. ✓ Export/import data
3. ✓ Analyze production trends
4. ✓ Plan deworming schedule

## 📈 Best Practices

✓ **DO:**
- Record data daily for accuracy
- Regular backups (Export weekly)
- Check dashboard for due dates
- Keep animal info updated
- Use descriptive notes

✗ **DON'T:**
- Leave browser storage full
- Ignore due vaccinations/deworming
- Forget to backup data
- Mix up animal dates
- Close without saving

## 🎯 Next Steps

1. **Add all your animals** to the system
2. **Set up vaccination schedule** for each animal
3. **Start daily production records** immediately
4. **Track nutrition consistently**
5. **Review reports weekly**
6. **Export backup monthly**
7. **Consider Firebase setup** for multi-device sync

## 🆘 Quick Help

### "Where do I add animals?"
Click "🐄 Animals" → Click "+ Add Animal"

### "How do I record milk?"
Click "🥛 Production" → Click "+ Record Production"

### "How do I track vaccinations?"
Click "💉 Vaccinations" → Click "+ Add Vaccination"

### "How do I see reports?"
Click "📈 Reports" to view charts

### "How do I backup data?"
Press Ctrl+E (Cmd+E on Mac) to export

---

**Ready to manage your farm?** Start by adding your first animal! 🚀

For detailed documentation, see `README.md`
For Firebase setup, see `FIREBASE_SETUP.md`
