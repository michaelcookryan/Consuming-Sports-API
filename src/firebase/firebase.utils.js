import { initializeApp } from "firebase/app";
import {
  getFirestore,
  getDoc,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_MESSAGING_APP_ID,
};

const app = initializeApp(config);
export const db = getFirestore(app);

// Set persistence to LOCAL to prevent auth state from being cleared
export const auth = getAuth();
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Auth persistence set successfully
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

export const createUserProfileDocument = async (userAuth, additionalData) => {
  if (!userAuth) return;
  const userRef = doc(db, "users", userAuth.uid);
  const snapShot = await getDoc(userRef);

  if (!snapShot.exists()) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        displayName,
        email,
        createdAt,
        ...additionalData,
      });
    } catch (error) {
      console.log("error creating user", error.message);
    }
  }
  return userRef; // Return the document reference instead of snapShot
};

// Function to listen to admin user changes with onSnapshot
export const listenToAdminUser = (userId, callback) => {
  if (!userId) return null;

  const userRef = doc(db, "users", userId);

  const unsubscribe = onSnapshot(
    userRef,
    (doc) => {
      if (doc.exists()) {
        const userData = {
          id: doc.id,
          ...doc.data(),
        };
        callback(userData);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to admin user:", error);
      callback(null);
    }
  );

  return unsubscribe;
};

export default db;
