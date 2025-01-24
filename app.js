const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose(); // Import SQLite package
const path = require('path');

// Middleware to parse JSON requests
app.use(express.json());
// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database connection
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create "records" table if it doesn't exist
db.run(
  `
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    details TEXT,
    total REAL
  )
  `,
  (err) => {
    if (err) {
      console.error('Error creating table:', err);
    }
  }
);

// API endpoint to save a new record
app.post('/api/records', (req, res) => {
  const { date, details, total } = req.body;

  // Validate the incoming data
  if (!date || !Array.isArray(details) || typeof total !== 'number') {
    return res.status(400).send({ error: 'Invalid request data' });
  }

  const detailsStr = JSON.stringify(details); // Convert details to a string for storage

  db.run(
    `
    INSERT INTO records (date, details, total) VALUES (?, ?, ?)
    `,
    [date, detailsStr, total],
    function (err) {
      if (err) {
        console.error('Error inserting record:', err.message);
        return res.status(500).send({ error: 'Database error' });
      }
      res.status(200).send({ id: this.lastID, date, details, total });
    }
  );
});

// API endpoint to fetch all records
app.get('/api/records', (req, res) => {
  db.all('SELECT * FROM records', (err, rows) => {
    if (err) {
      console.error('Error fetching records:', err.message);
      return res.status(500).send({ error: 'Database error' });
    }
    // Parse the "details" column back to JSON before sending the response
    const records = rows.map((row) => ({
      ...row,
      details: JSON.parse(row.details),
    }));
    res.status(200).send(records);
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
