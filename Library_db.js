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

// Option 7: Return a book
async function returnBook(conn, loanId) {
    const [loans] = await conn.execute(
        `SELECT loan_id, book_id, loan_status
         FROM Loan
         WHERE loan_id = ?`,
        [loanId]
    );

    if (loans.length === 0) {
        console.log('Loan not found.');
        return;
    }

    if (loans[0].loan_status === 'Returned') {
        console.log('This book has already been returned.');
        return;
    }

    await conn.beginTransaction();

    try {
        await conn.execute(
            `UPDATE Loan
             SET return_date = CURRENT_DATE(),
                 loan_status = 'Returned'
             WHERE loan_id = ?`,
            [loanId]
        );

        await conn.execute(
            `UPDATE Book
             SET available_copies = LEAST(available_copies + 1, total_copies)
             WHERE book_id = ?`,
            [loans[0].book_id]
        );

        await conn.commit();
        console.log('Book returned successfully.');
    } catch (error) {
        await conn.rollback();
        throw error;
    }
}

// Option 8: Cancel a reservation
async function cancelReservation(conn, reservationId) {
    const [reservations] = await conn.execute(
        `SELECT reservation_id, reservation_status
         FROM Reservation
         WHERE reservation_id = ?`,
        [reservationId]
    );

    if (reservations.length === 0) {
        console.log("Reservation not found.");
        return;
    }

    if (reservations[0].reservation_status === "Cancelled") {
        console.log("Reservation is already cancelled.");
        return;
    }

    await conn.execute(
        `UPDATE Reservation
         SET reservation_status = 'Cancelled'
         WHERE reservation_id = ?`,
        [reservationId]
    );

    console.log("Reservation cancelled successfully.");
}

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

// Display reservations
const [reservations] = await conn.execute(
    'SELECT * FROM Reservation'
);

console.log('\nReservations in the database:');
console.table(reservations);

// Display loans
const [loans] = await conn.execute(
    'SELECT * FROM Loan'
);

console.log('\nLoans in the database:');
console.table(loans);
    await returnBook(conn, 2);
    await cancelReservation(conn, 1);
    await conn.end();
}

main().catch(err => {
    console.error('Connection failed:', err.message);
});
