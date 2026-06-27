/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYVJJY36fiBbKsZtEZfYEZNPm4Ew3UM5k",
  authDomain: "porto-guru.firebaseapp.com",
  projectId: "porto-guru",
  storageBucket: "porto-guru.firebasestorage.app",
  messagingSenderId: "223932323326",
  appId: "1:223932323326:web:fb61efbed50b2f883e5caf",
  measurementId: "G-0HPY0GWZMM"
};

let app;
let db: any = null;
let auth: any = null;
let isFirebaseConnected = false;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
  auth = getAuth(app);
  isFirebaseConnected = true;
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.warn("Firebase failed to initialize. Using client-side local storage fallback.", error);
}

export { db, auth, isFirebaseConnected };
