import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { Platform } from 'react-native';

// Firebase configuration
// Credentials from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyCpQbRhi-8EZXL0RA7SNrL872l6pvgzjDU",
    authDomain: "caterconnect-d5060.firebaseapp.com",
    databaseURL: "https://caterconnect-d5060-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "caterconnect-d5060",
    storageBucket: "caterconnect-d5060.firebasestorage.app",
    messagingSenderId: "725853177610",
    appId: "1:725853177610:web:3f8a55b1600015d1491cf3",
    measurementId: "G-1FL6P9K9M3"
};

// Initialize Firebase (check if already initialized to prevent duplicate app error)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth with proper persistence for Expo
let auth: Auth;
try {
    // For Expo, use browser persistence which works across platforms
    auth = initializeAuth(app, {
        persistence: browserLocalPersistence
    });
} catch (error) {
    // If auth is already initialized, just get it
    auth = getAuth(app);
}

// Initialize Firestore (for structured data)
const db: Firestore = getFirestore(app);

// Initialize Realtime Database (for real-time updates)
const realtimeDb: Database = getDatabase(app);

export { app, auth, db, realtimeDb };
