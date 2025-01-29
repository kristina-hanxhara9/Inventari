import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import * as dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin (for backend authentication)
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccount = fs.existsSync(serviceAccountPath)
  ? JSON.parse(fs.readFileSync(serviceAccountPath))
  : null;

if (!serviceAccount) {
  throw new Error("Firebase service account credentials not found in environment variables");
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://furra-shqipe-default-rtdb.europe-west1.firebasedatabase.app"
});

// Initialize Firestore from Firebase Admin SDK
const db = admin.firestore();
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
    res.status(401).json({ error: "Unauthorized" , message: error.message});
  }
};

// Routes
app.get("/api/records", authenticate, async (req, res) => {
  try {
    const recordsRef = db.collection("database");
    const querySnapshot = await recordsRef.get();
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(records);
  } catch (err) {
    console.error("Error getting records:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

app.post("/api/records", authenticate, async (req, res) => {
  const { date, products, dailyTotal } = req.body;
  try {
       const docRef = await db.collection("database").add({
         date,
          products,
          dailyTotal
      });
      res.json({ id: docRef.id, date, products, dailyTotal });
  } catch (err) {
    console.error("Error adding record:", err.message);
    res.status(500).json({ error: "Error inserting record", message: err.message });
   }
});

app.put("/api/records/:id", authenticate, async (req, res) => {
  const { id } = req.params;
 const { date, products, dailyTotal } = req.body;
  try {
    const recordRef = db.collection("database").doc(id);
      await recordRef.update({
          date,
         products,
        dailyTotal
      });
    res.json({ id, date, products, dailyTotal});
  } catch (err) {
    console.error("Error updating record:", err.message);
    res.status(500).json({ error: "Error updating record", message: err.message });
  }
});

app.delete("/api/records/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const recordRef = db.collection("database").doc(id);
    await recordRef.delete();
    res.send("Record deleted");
  } catch (err) {
    console.error("Error deleting record:", err.message);
    res.status(500).json({ error: "Error deleting record", message: err.message });
  }
});

// Server start
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});