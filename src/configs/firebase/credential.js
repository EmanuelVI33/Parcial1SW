// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaYr7YooofZX-ON6QvDpFNxbT1e6aepL4",
  authDomain: "sequencediagram-440a7.firebaseapp.com",
  projectId: "sequencediagram-440a7",
  storageBucket: "sequencediagram-440a7.appspot.com",
  messagingSenderId: "713983986214",
  appId: "1:713983986214:web:d1f33f5a4b6bfbf4fc34e7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };
