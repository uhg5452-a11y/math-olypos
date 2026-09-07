/**
 * Firebase Configuration for Math Olympiad Hub
 * 
 * Supports both live Firebase / Firestore deployment and local offline mock mode.
 * To connect to live Firebase, populate your .env with the VITE_FIREBASE_* variables.
 */

export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyMathOlympiadHubMockKey2026",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "math-olympiad-hub.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "math-olympiad-hub",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "math-olympiad-hub.appspot.com",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcd1234efgh5678",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-MATHOLYMP"
};

// Check if Firebase credentials are fully configured in the environment
export const isLiveFirebaseConfigured = () => {
  return Boolean(
    import.meta.env?.VITE_FIREBASE_API_KEY &&
    import.meta.env?.VITE_FIREBASE_PROJECT_ID
  );
};
