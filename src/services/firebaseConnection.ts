
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDt1A5oUm2KGXOzHSKDWkxknfka2Volbo0",
  authDomain: "webcarrro.firebaseapp.com",
  projectId: "webcarrro",
  storageBucket: "webcarrro.appspot.com",
  messagingSenderId: "510821407105",
  appId: "1:510821407105:web:5e07eb03650cf39f813080"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {db, auth, storage}