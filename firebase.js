require("dotenv").config();
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {   
   apiKey: process.env.API_KEY,
   authDomain: "pantry-management-app-1cda3.firebaseapp.com",
   projectId: "pantry-management-app-1cda3",
   storageBucket: "pantry-management-app-1cda3.appspot.com",
   messagingSenderId: process.env.MESSAGE_SENDER_ID,
   appId: process.env.APP_ID,
   measurementId: process.env.MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export { firestore };