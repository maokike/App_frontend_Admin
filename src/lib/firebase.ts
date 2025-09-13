// @ts-nocheck
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "appadmin-a3f30",
  apiKey: "AIzaSyBWFRIAEKDm3WdyPkaLHT8OW6K-yEQjw9g",
  authDomain: "appadmin-a3f30.firebaseapp.com",
  projectId: "appadmin-a3f30",
  storageBucket: "appadmin-a3f30.firebasestorage.app",
  messagingSenderId: "533090173010",
  appId: "1:533090173010:web:2da612d8ef1e8012e05f8b",
  measurementId: "G-FDCJZCHENE"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
