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
// Option 9: View a member's loan history
async function viewLoanHistory(conn, cardId) {
    const [history] = await conn.execute(
        `SELECT
            l.loan_id,
            b.title,
            l.loan_date,
            l.due_date,
            l.return_date,
            l.loan_status
         FROM Loan l
         JOIN Book b
           ON l.book_id = b.book_id
         WHERE l.card_id = ?
         ORDER BY l.loan_date DESC`,
        [cardId]
    );

    if (history.length === 0) {
        console.log("No loan history found for this library card.");
        return;
    }

    console.log(`\nLoan history for card ${cardId}:`);
    console.table(history);
}
// Option 10: View overdue loans
async function viewOverdueLoans(conn) {
    const [overdue] = await conn.execute(
        `SELECT
            l.loan_id,
            b.title,
            l.card_id,
            l.due_date,
            l.loan_status
         FROM Loan l
         JOIN Book b
            ON l.book_id = b.book_id
         WHERE l.due_date < CURRENT_DATE()
           AND l.loan_status = 'Checked Out'`
    );

    if (overdue.length === 0) {
        console.log("\nNo overdue loans found.");
        return;
    }

    console.log("\nOverdue loans:");
    console.table(overdue);
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
    await viewOverdueLoans(conn);
    await conn.end();
}

main().catch(err => {
    console.error('Connection failed:', err.message);
});
