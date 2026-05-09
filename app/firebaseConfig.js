
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
   apiKey: "AIzaSyDrG6tD6GPC7kCZ3CNXmAhc_X5wXd643-E",
  authDomain: "laptop-shop-25c2c.firebaseapp.com",
  projectId: "laptop-shop-25c2c",
  storageBucket: "laptop-shop-25c2c.firebasestorage.app",
  messagingSenderId: "209150941153",
  appId: "1:209150941153:web:0f6bd22df7e37b5fffa4a0",
  measurementId: "G-0S28KCF6LV"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default {db};