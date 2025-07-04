// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDJJvVVsSCJAhurPO_6AmyIvY4-GwSKHjM",
  authDomain: "jobnest-bcp.firebaseapp.com",
  projectId: "jobnest-bcp",
  storageBucket: "jobnest-bcp.firebasestorage.app",
  messagingSenderId: "574277449182",
  appId: "1:574277449182:web:7dd3a3f193f1816119994f",
  measurementId: "G-PHT950JW9D"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
