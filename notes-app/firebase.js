import { initializeApp } from "firebase/app";
import {getFirestore, collection} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAds2hyPGGQ6SYbg_D2DOIKr2ztBG4dk8c",
  authDomain: "react-notes-scrimba-proj-a1f16.firebaseapp.com",
  projectId: "react-notes-scrimba-proj-a1f16",
  storageBucket: "react-notes-scrimba-proj-a1f16.appspot.com",
  messagingSenderId: "606820493324",
  appId: "1:606820493324:web:8ade10fef1387721f6a629"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const notesCollection = collection(db, "notes");