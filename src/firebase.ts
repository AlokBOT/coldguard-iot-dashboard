import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCCfuXyyvUqxaiItb9Jtyv-MrHEuxnpkU8",
  authDomain: "cold-storage-iot-c5726.firebaseapp.com",
  databaseURL: "https://cold-storage-iot-c5726-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cold-storage-iot-c5726",
  storageBucket: "cold-storage-iot-c5726.firebasestorage.app",
  messagingSenderId: "519029086582",
  appId: "1:519029086582:web:a88cad138bd2582d99c257"
};

// Initialize Firebase App instance
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize and export typed Realtime Database reference
export const db: Database = getDatabase(app);
export default app;