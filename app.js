const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();  // Import SQLite package
const path = require('path');

app.use(express.json());  // Built-in Express middleware for JSON parsing
app.use(express.static(path.join(__dirname)));

// Set up SQLite database connection
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    details TEXT,
    total REAL
  )
`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  }
});

// API to save a record
app.post('/api/records', (req, res) => {
  const { date, details, total } = req.body;
  const detailsStr = JSON.stringify(details);

  db.run(`
    INSERT INTO records (date, details, total) VALUES (?, ?, ?)
  `, [date, detailsStr, total], function (err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(200).send({ id: this.lastID });
  });
});

// API to get records
app.get('/api/records', (req, res) => {
  db.all('SELECT * FROM records', (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    const records = rows.map(row => ({
      ...row,
      details: JSON.parse(row.details)
    }));
    res.status(200).send(records);
  });
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
