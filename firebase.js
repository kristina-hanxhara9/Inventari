import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY, // Store this in the .env file in React
  authDomain: "furra-shqipe.firebaseapp.com",
  projectId: "furra-shqipe",
  storageBucket: "furra-shqipe.appspot.com",
  messagingSenderId: "15816511838",
  appId: "1:15816511838:web:3ab0c3e93d31549369bfcf",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const addRecord = async (record) => await addDoc(collection(db, "database"), record);
export const getRecords = async () => {
  const snapshot = await getDocs(collection(db, "database"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const updateRecord = async (id, updatedData) => await updateDoc(doc(db, "database", id), updatedData);
export const deleteRecord = async (id) => await deleteDoc(doc(db, "database", id));

export const signUp = async (email, password) => await createUserWithEmailAndPassword(auth, email, password);
export const login = async (email, password) => await signInWithEmailAndPassword(auth, email, password);
export const logout = async () => await signOut(auth);

export { db, auth };
