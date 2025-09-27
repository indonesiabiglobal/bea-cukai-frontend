importScripts("https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js");

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwaxETUJovkdr5dOGR4Og8UUGVwUg1f-M",
  authDomain: "bi-input.firebaseapp.com",
  projectId: "bi-input",
  storageBucket: "bi-input.firebasestorage.app",
  messagingSenderId: "282450141152",
  appId: "1:282450141152:web:e274bd97f9941dd01ed585",
  measurementId: "G-BE8TXM6CTS",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
