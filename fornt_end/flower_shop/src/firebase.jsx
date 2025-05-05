// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBFglGAbeL5NqUXB5CZtBvDkJ9n0EeuK9w",
    authDomain: "flowershop-51d25.firebaseapp.com",
    projectId: "flowershop-51d25",
    storageBucket: "flowershop-51d25.appspot.com", // ✅ Đúng
    messagingSenderId: "206447146083",
    appId: "1:206447146083:web:29e3e593c4b25ea6c73456",
    measurementId: "G-33HEX6LFF8"
  };

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
  
export { auth, googleProvider, facebookProvider };
