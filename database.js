const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define the database file path
const dbPath = path.join(__dirname, "database.db");

// Open a database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        initializeDatabase();
    }
});

// Function to create the table if it does not exist
function initializeDatabase() {
    db.run(
        `CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            Date TEXT,
            Produktet TEXT,
            Cmimi_per_cope REAL,
            Sasia INTEGER,
            Kostoja_Totale REAL,
            Pjesa_e_Pare_e_Dites INTEGER,
            Pjesa_e_Dyte_e_Dites INTEGER,
            Totali_Perfundimtar REAL
        )`,
        (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            } else {
                console.log("Table 'records' is ready.");
            }
        }
    );
}

module.exports = db;
