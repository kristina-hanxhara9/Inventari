const { Pool } = require("pg");

// PostgreSQL connection pool
const pool = new Pool({
    user: "postgres", // Replace with your PostgreSQL username
    host: "localhost", // Replace with your host
    database: "inventory_db", // Replace with your database name
    password: "Deon2020", // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});

module.exports = pool;
