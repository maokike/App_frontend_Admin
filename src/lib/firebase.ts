// @ts-nocheck
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "appadmin-a3f30",
  "appId": "1:675707797449:web:96823c8e438ffb089c8a94",
  "storageBucket": "appadmin-a3f30.appspot.com",
  "apiKey": "AIzaSyDEfeMpw3s2T3fS2yvJKdxns2Z3M5Chgog",
  "authDomain": "appadmin-a3f30.firebaseapp.com",
  "messagingSenderId": "675707797449"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
