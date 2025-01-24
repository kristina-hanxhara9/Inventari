const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());
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
    date TEXT NOT NULL,
    details TEXT NOT NULL,
    total REAL NOT NULL
  )
  `,
  (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    }
  }
);

// API endpoint to save a new record
app.post('/api/records', (req, res) => {
  const { date, details, total } = req.body;

  // Validate request data
  if (!date || !details || !Array.isArray(details) || typeof total !== 'number') {
    return res.status(400).send({ error: 'Invalid request data: Ensure details is an array and total is a number' });
  }

  const detailsStr = JSON.stringify(details); // Store details as a JSON string

  db.run(
    `INSERT INTO records (date, details, total) VALUES (?, ?, ?)`,
    [date, detailsStr, total],
    function (err) {
      if (err) {
        console.error('Error inserting record:', err.message);
        return res.status(500).send({ error: 'Database error' });
      }
      // Send the newly created record with the last inserted ID
      res.status(201).send({ id: this.lastID, date, details, total });
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

    const records = rows.map((row) => {
      let details;
      try {
        details = JSON.parse(row.details); // Parse details as JSON array
        if (!Array.isArray(details)) {
          throw new Error("Details is not an array");
        }
      } catch (parseError) {
        console.error('Error parsing details field:', parseError.message);
        details = []; // Fallback to an empty array if parsing fails
      }

      return {
        ...row,
        details, // Return the parsed details
      };
    });

    res.status(200).send(records); // Send all the records with parsed details
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
