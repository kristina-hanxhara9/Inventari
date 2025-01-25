const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors'); // For handling cross-origin requests

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.run(
  `CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    details TEXT,
    total REAL
  )`,
  (err) => {
    if (err) {
      console.error('Error creating database table:', err.message);
    }
  }
);

// API to save records
app.post('/api/records', (req, res) => {
  const { date, details, total } = req.body;

  if (!date || !Array.isArray(details) || typeof total !== 'number') {
    return res.status(400).json({ error: 'Invalid request payload. Ensure "date", "details" (array), and "total" (number) are provided.' });
  }

  db.run(
    'INSERT INTO records (date, details, total) VALUES (?, ?, ?)',
    [date, JSON.stringify(details), total],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save the record. ' + err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// API to fetch all records
app.get('/api/records', (req, res) => {
  db.all('SELECT * FROM records', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve records. ' + err.message });
    }

    res.json(
      rows.map((row) => ({
        id: row.id,
        date: row.date,
        details: JSON.parse(row.details),
        total: row.total,
      }))
    );
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
