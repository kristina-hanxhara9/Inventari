import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

// Initialize Firebase Admin (for backend authentication)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!serviceAccount) {
  throw new Error("Firebase service account credentials not found in environment variables");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://furra-shqipe-default-rtdb.europe-west1.firebasedatabase.app"
});

// Initialize Firestore
const db = getFirestore();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Middleware to check authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Routes
app.get("/api/records", authenticate, async (req, res) => {
  try {
    const recordsRef = collection(db, "database");
    const querySnapshot = await getDocs(recordsRef);
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/api/records", authenticate, async (req, res) => {
  const { date, products, quantity, total, part1, part2, finalTotal } = req.body;
  try {
    const docRef = await addDoc(collection(db, "database"), {
      date,
      products,
      quantity,
      total,
      part1,
      part2,
      finalTotal
    });
    res.json({ id: docRef.id, date, products, quantity, total, part1, part2, finalTotal });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting record");
  }
});

app.put("/api/records/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { date, products, quantity, total, part1, part2, finalTotal } = req.body;
  try {
    const recordRef = doc(db, "database", id);
    await updateDoc(recordRef, {
      date,
      products,
      quantity,
      total,
      part1,
      part2,
      finalTotal
    });
    res.json({ id, date, products, quantity, total, part1, part2, finalTotal });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

app.delete("/api/records/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const recordRef = doc(db, "database", id);
    await deleteDoc(recordRef);
    res.send("Record deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

// Server start
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
