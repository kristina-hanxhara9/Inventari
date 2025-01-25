const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3001; // Port set to 3001

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

const recordsFilePath = path.join(__dirname, "data", "records.json");

// API route to save records
app.post("/api/records", async (req, res) => {
    try {
        const record = req.body;

        // Ensure the data directory and file exist
        try {
            await fs.access(recordsFilePath);
        } catch {
            await fs.mkdir(path.dirname(recordsFilePath), { recursive: true });
            await fs.writeFile(recordsFilePath, "[]");
        }

        const data = await fs.readFile(recordsFilePath, "utf8");
        const records = JSON.parse(data);
        records.push(record);

        await fs.writeFile(recordsFilePath, JSON.stringify(records, null, 2));
        res.status(201).json({ message: "Të dhënat u ruajtën me sukses!" });
    } catch (error) {
        console.error("Error saving record:", error);
        res.status(500).json({ error: "Gabim gjatë ruajtjes së të dhënave." });
    }
});

// Serve the HTML page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
