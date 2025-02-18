// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUlDd48ZVsJ1Cw-cDsadP6rhvyIcfRHvc",
  authDomain: "book-log-8a498.firebaseapp.com",
  projectId: "book-log-8a498",
  storageBucket: "book-log-8a498.firebasestorage.app",
  messagingSenderId: "92608342345",
  appId: "1:92608342345:web:39daf07edb8b4fe2435298",
  measurementId: "G-FWPPZ211BC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firestore functions and variables
export { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc };

