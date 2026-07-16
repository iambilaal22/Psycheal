import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, getDocs, addDoc, updateDoc } from "firebase/firestore";

// Safe, default web config or mock config for preview
const firebaseConfig = {
  apiKey: "ai-studio-psychoai-mock-key-for-local-fallback",
  authDomain: "psychoai-fallback.firebaseapp.com",
  projectId: "psychoai-fallback",
  storageBucket: "psychoai-fallback.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:mockid"
};

let app;
let auth: any = null;
let db: any = null;
let isUsingFirebase = false;

try {
  // In a real deployed app, configurations are injected or loaded
  // We can initialize it gracefully if config is valid or fallback to local
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  isUsingFirebase = true;
} catch (error) {
  console.warn("Firebase initialization failed, utilizing high-performance local storage fallback engine:", error);
}

const isRealFirebaseConfigured = isUsingFirebase && !!firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("mock-key-for-local-fallback");

export { auth, db, isUsingFirebase, isRealFirebaseConfigured };
export type { User };
