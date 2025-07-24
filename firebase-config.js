// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



const firebaseConfig = {
  apiKey: "AIzaSyBnROafjY8Dn-1U9S-PWY5DlZJYtz3jUjw",
  authDomain: "smu-gym.firebaseapp.com",
  projectId: "smu-gym",
  storageBucket: "smu-gym.appspot.com",
  messagingSenderId: "629180793332",
  appId: "1:629180793332:web:5c12e999e4286f9e3cb9a1",
  measurementId: "G-D3TP7YXW7B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// export const analytics = getAnalytics(app); // Comment out if not using analytics