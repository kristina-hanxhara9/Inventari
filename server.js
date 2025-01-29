
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

// Initialize Firebase Admin (for backend authentication)
// Read Firebase credentials from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://furra-shqipe-default-rtdb.europe-west1.firebasedatabase.app"
});

// Initialize Firestore
const db = getFirestore();
const app = express();
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

// Fetch records from Firestore
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

// Insert a record into Firestore
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

// Update a record in Firestore
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

// Delete a record from Firestore
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
