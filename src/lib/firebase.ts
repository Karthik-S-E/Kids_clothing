import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoCACCNdgVtbb4vb0zdthZc7FM6CGyBxw",
  authDomain: "kandamma-kids.firebaseapp.com",
  projectId: "kandamma-kids",
  storageBucket: "kandamma-kids.appspot.com",
  messagingSenderId: "123423215384",
  appId: "1:123423215384:web:a75897ff83c47bc1f9d86d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);