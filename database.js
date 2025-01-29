const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function insertRecord(record) {
    const query = `
        INSERT INTO records (date, produktet, cmimi_per_cope, sasia, kostoja_totale, pjesa_e_pare_e_dites, pjesa_e_dyte_e_dites, totali_perfundimtar)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;

    const values = [
        record.date,
        record.produktet,
        record.cmimi_per_cope,
        record.sasia,
        record.kostoja_totale,
        record.pjesa_e_pare_e_dites,
        record.pjesa_e_dyte_e_dites,
        record.totali_perfundimtar,
    ];

    try {
        const result = await pool.query(query, values);
        return result.rows[0]; // Return the inserted record
    } catch (error) {
        console.error("Error inserting record:", error);
    }
}
