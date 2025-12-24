# Firebase Setup Guide for CaterConnect

## Overview
This guide will help you connect your CaterConnect app to Firebase for authentication and database services.

## Prerequisites
- A Google account
- Node.js and npm installed
- CaterConnect project set up

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "CaterConnect")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

## Step 2: Register Your App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "CaterConnect Web")
3. **Do NOT** check "Also set up Firebase Hosting" (unless you plan to use it)
4. Click **"Register app"**
5. You'll see your Firebase configuration object - **keep this page open**, you'll need these values

## Step 3: Enable Authentication

1. In the Firebase Console, go to **Build > Authentication**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

## Step 4: Enable Realtime Database

**CRITICAL: This step is required for business registration to work!**

1. In the Firebase Console, go to **Build > Realtime Database**
2. Click **"Create Database"**
3. Choose a location (select the closest to your users, e.g., **asia-southeast1** for Asia)
4. Select **"Start in test mode"** (we'll configure proper rules next)
5. Click **"Enable"**
6. Copy the database URL (e.g., `https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app`)

### Configure Database Security Rules

1. In Realtime Database, go to the **"Rules"** tab
2. Replace the default rules with the following:

```json
{
  "rules": {
    "businesses": {
      "$businessId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "customers": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$orderId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

3. Click **"Publish"**

> [!IMPORTANT]
> These rules allow any authenticated user to read/write data. For production, you should implement more restrictive rules based on your business logic.

## Step 5: Configure Your App

1. Open `config/firebase.ts` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",              // From Firebase Console
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "YOUR_DATABASE_URL",           // From Realtime Database (Step 4)
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Where to find these values:**
- Go to Firebase Console > Project Settings (gear icon) > General
- Scroll down to "Your apps" section
- You'll see your web app with all the configuration values
- The `databaseURL` is from Step 4 (Realtime Database)

## Step 5: Test the Connection

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to the Business Login screen

3. Try creating a new account:
   - Click **"Don't have an account? Sign Up"**
   - Enter an email and password (minimum 6 characters)
   - Click **"Sign Up"**
   - You should see a success message

4. Verify in Firebase Console:
   - Go to **Authentication > Users**
   - You should see your newly created user

5. Test logging in:
   - Enter the same email and password
   - Click **"Login"**
   - You should be redirected to the business dashboard

## Features Implemented

### Authentication
- ✅ Email/Password sign up
- ✅ Email/Password sign in
- ✅ Persistent authentication (stays logged in)
- ✅ Error handling with user-friendly messages
- ✅ Loading states during authentication

### Business Login Screen
- Toggle between Sign Up and Login modes
- Form validation
- Firebase error handling
- Loading indicators

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that you've replaced the placeholder API key with your actual key from Firebase Console

### "Firebase: Error (auth/project-not-found)"
- Verify your `projectId` is correct
- Make sure the Firebase project exists in the console

### "Firebase: Error (auth/network-request-failed)"
- Check your internet connection
- Verify Firebase services are not blocked by firewall

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Try clearing the cache: `npx expo start -c`

## Next Steps

### Optional Enhancements
1. **Add Password Reset**: Implement "Forgot Password" functionality
2. **Email Verification**: Require users to verify their email
3. **Social Login**: Add Google, Facebook, or Apple sign-in
4. **Firestore Database**: Set up Firestore for storing business data
5. **User Profiles**: Create user profile documents in Firestore

### Security Rules
Once you start using Firestore, set up security rules:
1. Go to **Firestore Database > Rules**
2. Configure appropriate read/write permissions

## Support
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
