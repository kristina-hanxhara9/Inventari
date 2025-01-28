const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./database");

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Route: Get all records
app.get("/api/records", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM records ORDER BY date DESC");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching records.");
    }
});

// Route: Add a record
app.post("/api/records", async (req, res) => {
    const { date, details, total } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO records (date, details, total) VALUES ($1, $2, $3) RETURNING *",
            [date, JSON.stringify(details), total]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error saving record.");
    }
});

// Route: Update a record
app.put("/api/records/:id", async (req, res) => {
    const { id } = req.params;
    const { date, details, total } = req.body;

    try {
        const result = await pool.query(
            "UPDATE records SET date = $1, details = $2, total = $3 WHERE id = $4 RETURNING *",
            [date, JSON.stringify(details), total, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating record.");
    }
});

// Route: Delete a record
app.delete("/api/records/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM records WHERE id = $1", [id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting record.");
    }
});

// Route: Test database connection
app.get('/api/test-connection', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.status(200).json({ status: 'success', timestamp: result.rows[0].now });
    } catch (err) {
        console.error('Database connection error:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
