import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQe0v4Zv6EsZStiQLOfs28hv9bWJrRENs",
  authDomain: "united-velocity-xn50x.firebaseapp.com",
  projectId: "united-velocity-xn50x",
  storageBucket: "united-velocity-xn50x.firebasestorage.app",
  messagingSenderId: "897057470623",
  appId: "1:897057470623:web:9730be436c96973f188aaa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(
  app, 
  "ai-studio-asistengurusmane-a7b755e3-fcc7-4105-99f7-23f6db92f837"
);

export { app, db };
