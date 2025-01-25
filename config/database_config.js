const { initializeApp } = require("firebase/app");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJm3-CrmuN9mrbU4r2yH4ZYaLIo66BwEA",
  authDomain: "smart-pill-box-32cd5.firebaseapp.com",
  databaseURL: "https://smart-pill-box-32cd5-default-rtdb.firebaseio.com",
  projectId: "smart-pill-box-32cd5",
  storageBucket: "smart-pill-box-32cd5.firebasestorage.app",
  messagingSenderId: "262837245373",
  appId: "1:262837245373:web:e3143f18a000410565eed4",
  measurementId: "G-Y3CXSB7M1Y"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
module.exports = firebaseApp;
