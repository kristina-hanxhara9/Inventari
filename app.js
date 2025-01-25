const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// SQLite Database Initialization
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

db.run(`
    CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        details TEXT,
        total REAL
    )
`);

// API to save records
app.post('/api/records', async (req, res) => {
    const { date, details, total } = req.body;

    if (!date || !details || typeof total !== 'number') {
        return res.status(400).send({ error: 'Invalid request data.' });
    }

    const detailsStr = JSON.stringify(details);

    db.run(
        'INSERT INTO records (date, details, total) VALUES (?, ?, ?)',
        [date, detailsStr, total],
        async function (err) {
            if (err) return res.status(500).send({ error: err.message });

            try {
                const apiResponse = await axios.post('https://inventari-okqu.onrender.com/api/records', { date, details, total });
                res.status(201).send(apiResponse.data);
            } catch (err) {
                console.error(err.message);
                res.status(500).send({ error: 'Failed to save record to external API.' });
            }
        }
    );
});

// API to fetch records
app.get('/api/records', (req, res) => {
    db.all('SELECT * FROM records', [], (err, rows) => {
        if (err) return res.status(500).send({ error: err.message });

        const records = rows.map(row => ({
            id: row.id,
            date: row.date,
            details: JSON.parse(row.details),
            total: row.total,
        }));

        res.status(200).send(records);
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
