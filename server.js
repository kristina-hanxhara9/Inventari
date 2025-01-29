require("dotenv").config();
const DATABASE_URL = process.env.DATABASE_URL;
console.log("Connected to DB at:", DATABASE_URL);

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Fetch records
app.get("/api/records", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM inventory_db ORDER BY date DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// Insert a record
app.post("/api/records", async (req, res) => {
    const { date, details, total } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO inventory_db (date, details, total) VALUES ($1, $2, $3) RETURNING *",
            [date, details, total]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error inserting record");
    }
});

// Update a record
app.put("/api/records/:id", async (req, res) => {
    const { id } = req.params;
    const { date, details, total } = req.body;
    try {
        const result = await pool.query(
            "UPDATE inventory_db SET date = $1, details = $2, total = $3 WHERE id = $4 RETURNING *",
            [date, details, total, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating record");
    }
});

// Delete a record
app.delete("/api/records/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM inventory_db WHERE id = $1", [id]);
        res.send("Record deleted");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting record");
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
