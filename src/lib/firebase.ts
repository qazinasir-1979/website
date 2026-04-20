/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: In production, these should be in .env and prefixed with VITE_
// For the AI Studio environment, we'd normally get these automatically.
// If automatic setup failed, you can provide your own config here.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBhM_Nu86iMyO7eLBUOrj2e6TS1EI6P_So",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "blogs-88660.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://blogs-88660-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "blogs-88660",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "blogs-88660.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "599616250471",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:599616250471:web:4b016f788739a259836ac2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1R0VDSQPBH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
