// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlfAL0X0QAme6J1kUt9Mrw-x56hYpzbIA",
  authDomain: "vajra-bank.firebaseapp.com",
  projectId: "vajra-bank",
  storageBucket: "vajra-bank.firebasestorage.app",
  messagingSenderId: "182172077360",
  appId: "1:182172077360:web:13a9e819df0b479b64ccf5"
};

// Initialize Firebase as a named app to avoid conflicts
const userApp = initializeApp(firebaseConfig, "userApp");

// Export Auth & Firestore
export const userAuth = getAuth(userApp);
export const userDB = getFirestore(userApp);