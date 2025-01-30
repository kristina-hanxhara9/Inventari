import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

// Fix: Parse the environment variable correctly
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, "\n"));

if (!serviceAccount) {
  throw new Error("Firebase service account credentials not found");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://furra-shqipe-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Middleware for authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return res.status(401).json({ error: "Unauthorized", message: err.message });
  }
};

// GET all records
app.get("/api/records", authenticate, async (req, res) => {
  try {
    const recordsRef = db.collection("database");
    const snapshot = await recordsRef.get();
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(records);
  } catch (err) {
    console.error("Error fetching records:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// POST a new record
app.post("/api/records", authenticate, async (req, res) => {
  try {
    const { date, products, dailyTotal } = req.body;
    const docRef = await db.collection("database").add({ date, products, dailyTotal });
    res.json({ id: docRef.id, date, products, dailyTotal });
  } catch (err) {
    console.error("Error adding record:", err.message);
    res.status(500).json({ error: "Error inserting record", message: err.message });
  }
});

// UPDATE a record
app.put("/api/records/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { date, products, dailyTotal } = req.body;

  try {
    const recordRef = db.collection("database").doc(id);
    await recordRef.update({ date, products, dailyTotal });
    res.json({ id, date, products, dailyTotal });
  } catch (err) {
    console.error("Error updating record:", err.message);
    res.status(500).json({ error: "Error updating record", message: err.message });
  }
});

// DELETE a record
app.delete("/api/records/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const recordRef = db.collection("database").doc(id);
    await recordRef.delete();
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error("Error deleting record:", err.message);
    res.status(500).json({ error: "Error deleting record", message: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
