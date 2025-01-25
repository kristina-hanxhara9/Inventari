const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;  // changed port to 3001

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory
const recordsFilePath = path.join(__dirname, 'records.json');

app.post('/api/records', async (req, res) => {
  try {
    const record = req.body;

    // Check if the file exists, create it if not.
     try {
        await fs.access(recordsFilePath);
     } catch (error) {
        await fs.writeFile(recordsFilePath, '[]', 'utf-8');
     }

    const data = await fs.readFile(recordsFilePath, 'utf-8');
    const records = JSON.parse(data);
    records.push(record);

    await fs.writeFile(recordsFilePath, JSON.stringify(records, null, 2), 'utf-8');

    res.status(201).json({ message: 'Record saved successfully' });
  } catch (error) {
    console.error('Error saving record:', error);
    res.status(500).json({ error: 'Failed to save record' });
  }
});


// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});