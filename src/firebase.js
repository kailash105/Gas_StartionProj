// Core Firebase
import { initializeApp } from "firebase/app";

// Firebase services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAfT1MMqDWI5wuzd55eW2fExAzbudQYSAI",
    authDomain: "gas-station-app-v2.firebaseapp.com",
    projectId: "gas-station-app-v2",
    storageBucket: "gas-station-app-v2.appspot.com",
    messagingSenderId: "291314378642",
    appId: "1:291314378642:web:1a63b1de6789aa8a8d434b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export services (ONLY ONCE)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Cloud Functions (IMPORTANT: region must match)
export const functions = getFunctions(app, "us-central1");

export default app;
