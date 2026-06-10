// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_wtYtFMc-3bskLFXMHv8U97JGTba0aj0",
  authDomain: "fire-app-94d6f.firebaseapp.com",
  projectId: "fire-app-94d6f",
  storageBucket: "fire-app-94d6f.firebasestorage.app",
  messagingSenderId: "1062603324892",
  appId: "1:1062603324892:web:6d32a1206b575a3fd5a319",
  measurementId: "G-53VG7LW5HQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);