import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxvvKl0SzVWcfF7CKnp9rghIdaU5cLPn4",
  authDomain: "seagull-sports.firebaseapp.com",
  projectId: "seagull-sports",
  storageBucket: "seagull-sports.firebasestorage.app",
  messagingSenderId: "72239690844",
  appId: "1:72239690844:web:58cdddf507c021c886e299",
  measurementId: "G-MXF10TZF32",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Auth for your AuthController and screens
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (optional, only if you need to track user behavior)
export const analytics = getAnalytics(app);
