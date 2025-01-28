const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./database"); // Import the database connection

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

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

// Serve frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
