import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwaxETUJovkdr5dOGR4Og8UUGVwUg1f-M",
    authDomain: "bi-input.firebaseapp.com",
    projectId: "bi-input",
    storageBucket: "bi-input.firebasestorage.app",
    messagingSenderId: "282450141152",
    appId: "1:282450141152:web:e274bd97f9941dd01ed585",
    measurementId: "G-BE8TXM6CTS"
  };

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = getMessaging(firebaseApp);

export { messaging, getToken, onMessage };
