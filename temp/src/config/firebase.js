// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3B9owv3AbK9pupIxlrvQYNdsWmQrIxIw",
  authDomain: "geolocation-c8fa1.firebaseapp.com",
  projectId: "geolocation-c8fa1",
  storageBucket: "geolocation-c8fa1.appspot.com",
  messagingSenderId: "437052534338",
  appId: "1:437052534338:web:c7d49a9fd508d6530807db",
  measurementId: "G-WFHD3TRX48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics and check if it's in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, db, analytics }; 