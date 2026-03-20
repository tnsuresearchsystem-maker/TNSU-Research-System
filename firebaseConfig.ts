
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDtGRy3viI5kCWhlrjT1I2_rJaZpmlzj2k",
  authDomain: "tnsu-research-system.firebaseapp.com",
  projectId: "tnsu-research-system",
  storageBucket: "tnsu-research-system.firebasestorage.app",
  messagingSenderId: "888497754868",
  appId: "1:888497754868:web:5cca4206350ae27d73c4a1",
  measurementId: "G-MTPXWC52GY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
