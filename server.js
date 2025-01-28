const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to the SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Error opening database: ", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Route to add a record to the database
app.post("/api/records", (req, res) => {
    const { date, produktet, cmimi_per_cope, sasia, kostoja_totale, pjesa_e_pare_e_dites, pjesa_e_dyte_e_dites, totali_perfundimtar } = req.body;

    const query = `
        INSERT INTO records (Date, Produktet, Cmimi_per_cope, Sasia, Kostoja_Totale, Pjesa_e_Pare_e_Dites, Pjesa_e_Dyte_e_Dites, Totali_Perfundimtar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [date, produktet, cmimi_per_cope, sasia, kostoja_totale, pjesa_e_pare_e_dites, pjesa_e_dyte_e_dites, totali_perfundimtar], function (err) {
        if (err) {
            console.error("Error inserting record:", err.message);
            return res.status(500).json({ error: "Gabim gjatë ruajtjes së të dhënave." });
        }
        res.status(201).json({ message: "Të dhënat u ruajtën me sukses!", id: this.lastID });
    });
});

// Route to fetch all records
app.get("/api/records", (req, res) => {
    db.all("SELECT * FROM records", [], (err, rows) => {
        if (err) {
            console.error("Error fetching records:", err.message);
            return res.status(500).json({ error: "Gabim gjatë marrjes së të dhënave." });
        }
        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
