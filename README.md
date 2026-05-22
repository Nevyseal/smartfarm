# 🌾 Smart Farm Manager Application

A comprehensive web-based farm management system for managing cattle, sheep, and goats with integrated tracking for vaccinations, production, nutrition, and deworming schedules.

## Features

### 📊 Dashboard
- Real-time statistics (total animals, daily milk production, pending vaccinations, deworming schedules)
- Production trend charts (weekly view)
- Animal distribution visualization

### 🐄 Animal Management
- Add and manage cows, sheep, and goats
- Track animal details (age, weight, status, date added)
- View all animal information in organized cards

### 💉 Vaccination Records
- Track vaccinations for all vaccine types (ECF, CBPP, LSD, FMD, etc.)
- Schedule next vaccination dates
- Identify overdue and upcoming vaccinations
- Record veterinarian information

### 🥛 Milk Production
- Record 3 times daily production (morning, afternoon, evening)
- Track daily and monthly production totals
- View production trends with charts
- Automatic calculations

### 🌾 Nutrition Management
- Track forage intake (hay bales, silage, baby corn, nappier grass)
- Record concentrate amounts (dairy meal, maize meal, wheat products)
- Monitor salt usage
- Detailed nutrition records per animal

### 💊 Deworming Schedule
- Record deworming date and brand
- Track deworming amounts
- Schedule next deworming dates (default: 90 days)
- Manage deworming schedules

### 📈 Reports & Analytics
- Monthly production trends
- Animal health status
- Vaccination coverage percentages
- Deworming schedule status

### ⚙️ Settings
- Configure farm information (name, location, contact)
- Export/Import functionality (via keyboard shortcuts)
- Data persistence via Firebase or local storage

## Project Structure

```
farm-manager-app/
├── index.html                 # Main HTML file
├── css/
│   └── style.css             # All styling
├── js/
│   ├── config.js             # Firebase configuration
│   ├── utils.js              # Utility functions
│   ├── animals.js            # Animal management module
│   ├── vaccinations.js       # Vaccination tracking module
│   ├── production.js         # Milk production module
│   ├── nutrition.js          # Nutrition management module
│   ├── deworming.js          # Deworming schedule module
│   ├── charts.js             # Charts and visualization
│   └── main.js               # Main application controller
├── assets/                   # Images, icons, etc.
└── README.md                 # This file
```

## Modular Architecture

Each module is self-contained and handles its own:
- **Event listeners**: Form handling and UI interactions
- **Database operations**: CRUD operations with Firebase/Local Storage fallback
- **Data management**: Filtering, sorting, calculations
- **UI rendering**: Creating and updating DOM elements
- **Exports**: Public APIs for inter-module communication

### Module Communication Flow

```
main.js (App Controller)
    ├─ Animals Module
    ├─ Vaccinations Module
    ├─ Production Module
    ├─ Nutrition Module
    ├─ Deworming Module
    ├─ Charts Module
    └─ Utilities & Storage
```

## Installation & Setup

### Step 1: Clone or Extract Files
Navigate to your project directory:
```bash
cd farm-manager-app
```

### Step 2: Open in Browser
Simply open `index.html` in a web browser. The app works offline using browser local storage!

### Step 3 (Optional): Setup Firebase

To use cloud synchronization and multi-device sync:

1. Create a Firebase project at https://firebase.google.com
2. Enable Firestore Database
3. Enable Authentication (optional)
4. Copy your Firebase config
5. Update `js/config.js` with your credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 4 (Optional): Setup Web Server
For better performance and security, host on a web server:

Using Python:
```bash
python -m http.server 8000
```

Using Node.js:
```bash
npx http-server
```

Then access: http://localhost:8000

## Database Schema

### Collections Structure

#### Animals Collection
```json
{
  "id": "unique_id",
  "type": "cow|sheep|goat",
  "name": "Animal ID/Name",
  "age": 24,
  "weight": 450.5,
  "dateAdded": "2024-01-15",
  "status": "active|inactive",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Vaccinations Collection
```json
{
  "id": "unique_id",
  "animalId": "reference_to_animal",
  "vaccineType": "FMD|ECF|CBPP|etc",
  "dateVaccinated": "2024-01-20",
  "nextDueDate": "2024-04-20",
  "veterinarian": "Dr. Smith",
  "notes": "Additional notes",
  "createdAt": "2024-01-20T10:30:00Z"
}
```

#### Production Collection
```json
{
  "id": "unique_id",
  "animalId": "reference_to_animal",
  "date": "2024-01-20",
  "morning": 15.5,
  "afternoon": 12.3,
  "evening": 14.2,
  "total": 42.0,
  "notes": "Observations",
  "createdAt": "2024-01-20T10:30:00Z"
}
```

#### Nutrition Collection
```json
{
  "id": "unique_id",
  "animalId": "reference_to_animal",
  "date": "2024-01-20",
  "forage": {
    "hayBales": 5,
    "silageCorn": 2,
    "babyCorn": 1,
    "nappierGrass": 3
  },
  "concentrates": {
    "dairyMeal": 2,
    "maizeMeal": 1.5,
    "maizeGerm": 1,
    "wheatBran": 0.5,
    "wheatPollard": 0.5,
    "molasses": 0.2,
    "machicha": 0.5
  },
  "salts": {
    "salt": 0.1
  },
  "createdAt": "2024-01-20T10:30:00Z"
}
```

#### Deworming Collection
```json
{
  "id": "unique_id",
  "animalId": "reference_to_animal",
  "dateDewomed": "2024-01-20",
  "brand": "Levamisole",
  "amount": 2.5,
  "nextDueDate": "2024-04-20",
  "veterinarian": "Dr. Smith",
  "notes": "Additional notes",
  "createdAt": "2024-01-20T10:30:00Z"
}
```

## Usage Guide

### Adding an Animal
1. Click "🐄 Animals" in sidebar
2. Click "+ Add Animal"
3. Fill in animal details
4. Click "Save Animal"

### Recording Vaccinations
1. Click "💉 Vaccinations"
2. Click "+ Add Vaccination"
3. Select animal and vaccine type
4. Set vaccination dates
5. Click "Save Vaccination"

### Tracking Production
1. Click "🥛 Production"
2. Click "+ Record Production"
3. Enter milk amounts for each session
4. Click "Save Production"

### Managing Nutrition
1. Click "🌾 Nutrition"
2. Click "+ Record Nutrition"
3. Enter feed amounts
4. Click "Save Nutrition"

### Deworming Records
1. Click "💊 Deworming"
2. Click "+ Record Deworming"
3. Fill in dewormer details
4. Click "Save Deworming"

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S / Cmd+S | Print current view |
| Ctrl+E / Cmd+E | Export data as JSON |

## Data Export & Import

### Export
Press `Ctrl+E` to download all data as JSON file.

### Import
Manually place JSON file in localStorage using browser console:
```javascript
Storage.set('animals', importedData.animals);
// Repeat for other collections
```

## Features & Calculations

### Production Stats
- **Daily Average**: Average of last 7 days
- **Monthly Total**: Sum of current month
- **Daily Total**: Sum of morning + afternoon + evening

### Vaccination Status
- **Current**: Vaccination up to date
- **Due Soon**: Due within 7 days
- **Overdue**: Past due date

### Deworming Schedule
- **Default**: 90 days between treatments
- **Status Tracking**: Overdue, Due Soon, Current

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js 3.9.1
- **Database**: Firebase Firestore (optional)
- **Storage**: Browser LocalStorage (fallback)
- **Authentication**: Firebase Auth (optional)

## API Reference

### Animals Module
```javascript
Animals.getAll()           // Get all animals
Animals.getByType('cow')   // Get cows only
Animals.getActive()        // Get active animals only
Animals.getById('id')      // Get specific animal
Animals.update('id', {})   // Update animal
```

### Vaccinations Module
```javascript
Vaccinations.getAll()           // Get all vaccinations
Vaccinations.getByAnimal('id')  // Get for specific animal
Vaccinations.getOverdue()       // Get overdue vaccinations
Vaccinations.getDueSoon()       // Get due soon
```

### Production Module
```javascript
Production.getAll()                    // Get all records
Production.getByAnimal('id')          // Get for animal
Production.getTodayTotal()            // Today's production
Production.getTotalByDate('date')     // Specific date total
Production.getByDateRange(s, e)       // Date range
```

### Nutrition Module
```javascript
Nutrition.getAll()                           // Get all records
Nutrition.getByAnimal('id')                 // Get for animal
Nutrition.getTotalForagePeriod(s, e)        // Forage total
Nutrition.getTotalConcentratesPeriod(s, e)  // Concentrates total
```

### Deworming Module
```javascript
Deworming.getAll()          // Get all records
Deworming.getByAnimal('id') // Get for animal
Deworming.getOverdue()      // Overdue
Deworming.getDueSoon()      // Due soon
```

### Charts Module
```javascript
Charts.updateAll()                    // Update all charts
Charts.updateProductionChart()        // Production
Charts.updateAnimalDistributionChart() // Distribution
Charts.updateDashboardCharts()        // Dashboard
Charts.updateMonthlyProductionChart() // Monthly
```

## Troubleshooting

### Data not saving?
- Check browser console for errors (F12)
- Enable cookies and local storage in browser
- Try incognito/private mode
- Verify Firebase config if using cloud

### Charts not displaying?
- Ensure Chart.js is loaded
- Check browser console
- Try refreshing page
- Verify data exists

### Firebase not connecting?
- Verify API keys in config.js
- Check Firebase project credentials
- Ensure Firestore is enabled
- Check browser console for errors

## Performance Tips

- Keep animal count reasonable (100+)
- Regularly export data for backup
- Clear old records periodically
- Use production-ready Firebase project
- Enable CDN caching for assets

## Security Notes

⚠️ **Important**: This application stores sensitive farm data.

- Use HTTPS when deployed
- Keep Firebase API keys secure
- Regular data backups
- Use Firestore security rules in production
- Implement user authentication
- Consider data encryption

## Future Enhancements

- User authentication
- Multi-user support
- Mobile app version
- SMS notifications
- Weather integration
- Veterinary alerts
- Feed cost tracking
- Milk quality analysis
- Breeding records
- Financial reports

## Support & Contributing

For issues or contributions, please refer to the main project documentation.

## License

This project is provided as-is for agricultural use.

## Credits

Developed for Smart Farming Management Systems
Incorporating best practices for livestock management

---

**Last Updated**: May 2024
**Version**: 1.0.0
