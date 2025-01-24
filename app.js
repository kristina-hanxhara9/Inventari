const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios'); // Import axios for making external requests
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
app.post('/api/records', async (req, res) => {
  const { date, details, total } = req.body;

  // Validate request data
  if (!date || !details || !Array.isArray(details) || typeof total !== 'number') {
    return res.status(400).send({ error: 'Invalid request data: Ensure details is an array and total is a number' });
  }

  const detailsStr = JSON.stringify(details); // Store details as a JSON string

  // Send the record to the external API
  try {
    const response = await axios.post('https://inventari-okqu.onrender.com/api/records', {
      date,
      details,
      total,
    });

    // Handle successful response from external API
    res.status(201).send(response.data); // Forward the response from the external API
  } catch (error) {
    console.error('Error inserting record:', error.message);
    return res.status(500).send({ error: 'Failed to save record to external API' });
  }
});

// Fetch records from external API with logging
app.get('/api/records', async (req, res) => {
  try {
    console.log('Fetching records from external API...');
    const response = await axios.get('https://inventari-okqu.onrender.com/api/records');
    console.log('Received records:', response.data); // Log the response data
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error fetching records from external API:', error.message);
    console.error('Error response:', error.response ? error.response.data : 'No response data');
    return res.status(500).send({ error: 'Failed to fetch records from external API' });
  }
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
