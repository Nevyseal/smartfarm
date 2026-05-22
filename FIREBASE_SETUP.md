# Firebase Setup Guide

This guide will help you set up Firebase for the Smart Farm Manager application to enable cloud data synchronization across devices.

## Prerequisites

- Google account
- Modern web browser
- Basic understanding of Firebase

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project" or "Add Project"
3. Enter project name: `SmartFarmManager` (or your preferred name)
4. Accept the terms
5. Click "Create Project"
6. Wait for project creation to complete

## Step 2: Register Your App

1. In Firebase Console, click the web icon `</>`
2. Enter App nickname: `Farm Manager App`
3. Optionally check "Also set up Firebase Hosting for this app"
4. Click "Register App"
5. Copy the Firebase Config

You'll see code like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

## Step 3: Setup Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your region
5. Click "Enable"

### Create Collections

The database will automatically create collections when you add data. Manual setup:

1. Click "Start Collection"
2. Create these collections:
   - `animals`
   - `vaccinations`
   - `production`
   - `nutrition`
   - `deworming`

## Step 4: Configure Security Rules

1. Go to "Firestore Database" > "Rules"
2. For development (test mode), use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for all users during development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

## Step 5: Setup Authentication (Optional)

1. Go to "Authentication" > "Sign-in method"
2. Click "Email/Password" > Enable > Save
3. Go to "Users" to manage user accounts
4. Click "Add User" to create test accounts

## Step 6: Update Config File

1. Open `js/config.js` in your app
2. Replace the `firebaseConfig` object with your credentials:

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

3. Save the file

## Step 7: Test Connection

1. Open the app in browser
2. Check browser console (F12)
3. Look for: "Firebase initialized successfully"
4. Add a test animal
5. Check Firebase Console > Firestore > animals collection
6. Data should appear in real-time

## Firestore Database Rules Examples

### Development Rules (Allow All)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Production Rules (Authenticated Users Only)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Farm-Specific Rules (By User ID)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /farms/{farmId} {
      allow read, write: if request.auth.uid == resource.data.ownerId;
    }
    match /animals/{animalId} {
      allow read, write: if request.auth.uid == resource.data.farmOwnerId;
    }
    match /vaccinations/{vaccId} {
      allow read, write: if request.auth.uid == resource.data.farmOwnerId;
    }
    match /production/{prodId} {
      allow read, write: if request.auth.uid == resource.data.farmOwnerId;
    }
    match /nutrition/{nutId} {
      allow read, write: if request.auth.uid == resource.data.farmOwnerId;
    }
    match /deworming/{dewId} {
      allow read, write: if request.auth.uid == resource.data.farmOwnerId;
    }
  }
}
```

## Troubleshooting

### "Permission denied" error
- Check Firestore rules (likely in test mode)
- Verify Firebase config is correct
- Check browser console for errors

### Data not syncing
- Refresh browser
- Check network connection
- Verify API keys in config.js
- Check Firestore limits

### Firebase not initializing
- Check API keys spelling
- Ensure Firebase libraries are loaded
- Check browser console for errors
- Try incognito/private mode

## Backup & Export Data

### Export from Firestore
1. Firebase Console > Settings > Project Settings
2. Scroll to "Firestore Database"
3. Click the menu > Export Collections
4. Choose location and export

### Import Data
1. Firebase Console > Settings > Project Settings
2. Click "Import Collections"
3. Select your backup file
4. Follow prompts

## Firebase Limits & Pricing

### Free Tier (Spark Plan)
- 1GB storage
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- Good for testing/small farms

### Blaze Plan (Pay-as-you-go)
- More generous limits
- Pay only for what you use
- Better for production farms

### Optimization Tips
1. Batch write operations
2. Use indexes for queries
3. Implement data pagination
4. Cache data locally
5. Delete old records periodically

## Next Steps

1. Set up user authentication if needed
2. Implement backup strategies
3. Configure Firestore indexes
4. Set up monitoring
5. Plan data retention policies

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Pricing](https://firebase.google.com/pricing)

## Support

For issues:
1. Check Firebase Console logs
2. Review browser console errors
3. Verify network connectivity
4. Test with demo data
5. Check Firestore quota limits

---

**Last Updated**: May 2024
**Firebase SDK**: 9.22.0
