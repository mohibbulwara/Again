
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyCfqpsCxS2dkmQUaKDHAd7EWS6-ixCL4EE",
  authDomain: "chefs-bd.firebaseapp.com",
  projectId: "chefs-bd",
  storageBucket: "chefs-bd.appspot.com",
  messagingSenderId: "715801468404",
  appId: "1:715801468404:web:cd31745ac650c715db2da1",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "https://res.cloudinary.com/drewes4b7/image/upload/v1754783345/Untitled_design_hzm7wn.png", // Your app's logo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
