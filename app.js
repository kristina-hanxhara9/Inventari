const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Client } = require('pg');  // Importing pg package
const path = require('path');
require('dotenv').config();  // Loads environment variables from a .env file

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Set up PostgreSQL client with environment variables (DATABASE_URL from Render/Railway)
const client = new Client({
  connectionString: process.env.DATABASE_URL,  // PostgreSQL connection URL
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect to PostgreSQL database
client.connect();

// Create table if it doesn't exist
client.query(`
  CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
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

  client.query(`
    INSERT INTO records (date, details, total) VALUES ($1, $2, $3) RETURNING id
  `, [date, detailsStr, total], (err, result) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(200).send({ id: result.rows[0].id });
  });
});

// API to get records
app.get('/api/records', (req, res) => {
  client.query('SELECT * FROM records', (err, result) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    const records = result.rows.map(row => ({
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
