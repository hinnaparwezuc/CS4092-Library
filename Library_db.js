// Library_db.js — Library Management System
// Database connection only. Run with: node Library_db.js
// Requires: npm install mysql2 dotenv
// Requires a .env file in the same folder  

require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function main() {
    const conn = await mysql.createConnection(dbConfig);
    console.log('Connected to library_system database.');


// NEW: run a query and get the results back
    const [rows] = await conn.execute('SELECT * FROM Member');

    // NEW: print each row to the terminal
    console.log('\nMembers in the database:');
    rows.forEach(row => {
        console.log(`  [${row.member_id}] ${row.first_name} ${row.last_name} — ${row.email}`);
    });


    await conn.end();
}

main().catch(err => {
    console.error('Connection failed:', err.message);
});
