import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCN7pOxNsGIQ8bUfVErjoKi8v7vmoMPMb0",
  authDomain: "rently-e0e65.firebaseapp.com",
  projectId: "rently-e0e65",
  storageBucket: "rently-e0e65.firebasestorage.app",
  messagingSenderId: "529379590093",
  appId: "1:529379590093:web:5b0745387790e19fb48e84",
  measurementId: "G-YWM0QPF2FV",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export { auth, provider, signInWithPopup, signInWithGoogle };
