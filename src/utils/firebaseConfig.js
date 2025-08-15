// src/utils/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
} from '@env';

// Debug environment variable loading (without exposing actual values)
console.log('Environment variables loaded:', {
  hasApiKey: !!API_KEY,
  hasAuthDomain: !!AUTH_DOMAIN,
  hasProjectId: !!PROJECT_ID,
  hasStorageBucket: !!STORAGE_BUCKET,
  hasMessagingSenderId: !!MESSAGING_SENDER_ID,
  hasAppId: !!APP_ID,
});

// Your web app's Firebase configuration is read from the .env file
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services for use in other parts of the app
export const auth = getAuth(app);
export const firestore = getFirestore(app);