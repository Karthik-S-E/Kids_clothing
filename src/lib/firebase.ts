import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDoCaCCNdgVtbb4vb0zdthZc7FM6CGyBxw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kandamma-kids.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kandamma-kids",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kandamma-kids.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123423215384",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123423215384:web:a75897ff83c47bc1f9d86d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);