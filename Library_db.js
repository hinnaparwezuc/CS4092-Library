// Library_db.js — Library Management System
// Database connection only. Run with: node Library_db.js
// Requires: npm install mysql2 dotenv
// Requires a .env file in the same folder  

require('dotenv').config();
const mysql = require('mysql2/promise');
const prompt = require('prompt-sync')();
// const readline = require('readline');

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

// Option 8: Reserve book when unavailable
async function reserveBook(conn, cardId, bookId) {

    const [books] = await conn.execute(
        `SELECT available_copies
         FROM Book
         WHERE book_id = ?`,
        [bookId]
    );

    if (books.length === 0) {
        console.log("Book not found.");
        return;
    }

    if (books[0].available_copies > 0) {
        console.log("Book is available. No reservation needed.");
        return;
    }

    await conn.execute(
        `INSERT INTO Reservation
        (card_id, book_id, reservation_date, reservation_status)
        VALUES (?, ?, CURRENT_DATE(), 'Reserved')`,
        [cardId, bookId]
    );

    console.log("Book reserved successfully.");
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
    console.log('Connected to library_system database.\n');
    // Display welcome and check-in prompt message
    console.log("Welcome to our Library System.\nLet's get you checked in! What would you like to do?\n");
    console.log("L) Staff Login\nR) New staff registeration.\n");
    var userCheckInChoice = prompt("Please select an option (L or R) below: ");

    // check what check-in option user selected
    if (userCheckInChoice == "L") { //user selected to login
        console.log("\nGreat, let's get you logged in. Answer the following questions:");
        var staffFirstName = prompt("What is your first name? ");
        var staffLastName = prompt("What is your last name? ");
        const [staffIds] = await conn.execute(
            'SELECT staff_id FROM Staff WHERE first_name = ? AND last_name = ?',
            [staffFirstName, staffLastName]
        );
        var staffId = staffIds.length > 0 ? staffIds[0].staff_id : null;
        // check if user is a registered staff
        if (staffId == null) { //if user is not a registered staff, ask to register them
            console.log("\nYou are not currently registered as a staff in this library system.\n");
            var userRegisterationChoice = prompt("Would you like to register (Y/N)? ");
            if (userRegisterationChoice == "N") { // if user does not want to create new account
                console.log("\nThank you for visiting! Quitting program...\n");
                return;
            }
            // if user wants to create new account
            console.log("\nWelcome new staff. Let's create an account for you.");
            staffFirstName = prompt("What is your first name? ");
            staffLastName = prompt("What is your last name? ");
            await conn.query(
                'INSERT INTO Staff(first_name, last_name) VALUES (?,?)',
                [staffFirstName, staffLastName]
            );
            const [staffs] = await conn.execute(
                'SELECT * FROM Staff WHERE first_name = ? AND last_name = ?',
                [staffFirstName, staffLastName]
            );
            const staff = staffs[0];
            const staffId = staff.staff_id;
            console.log(`Successfully registered as ${staff.first_name} ${staff.last_name}!`);
        } else{
            const [staffs] = await conn.execute(
            'SELECT * FROM Staff WHERE staff_id = ?',
            [staffId]
            );
            const staff = staffs[0];
            console.log(`Successfully logged in as ${staff.first_name} ${staff.last_name}!`);
        }
        return;
    } 
    else{ //user selected to register
        console.log("\nWelcome new staff. Let's create an account for you.");
        var staffFirstName = prompt("What is your first name? ");
        var staffLastName = prompt("What is your last name? ");
        await conn.query(
            'INSERT INTO Staff(first_name, last_name) VALUES (?,?)',
            [staffFirstName, staffLastName]
        );
        const [staffs] = await conn.execute(
            'SELECT * FROM Staff WHERE first_name = ? AND last_name = ?',
            [staffFirstName, staffLastName]
        );
        const staff = staffs[0];
        const staffId = staff.staff_id;
        console.log(`Successfully registered as ${staff.first_name} ${staff.last_name}!`);
        return;
    }
    
// OLD CODE: run a query and get the results back
    // const [rows] = await conn.execute('SELECT * FROM Member');

    // // NEW: print each row to the terminal
    // console.log('\nMembers in the database:');
    // rows.forEach(row => {
    //     console.log(`  [${row.member_id}] ${row.first_name} ${row.last_name} — ${row.email}`);
    // });

    
    // // Display reservations
    // const [reservations] = await conn.execute(
    //     'SELECT * FROM Reservation'
    // );

    // console.log('\nReservations in the database:');
    // console.table(reservations);

    // // Display loans
    // const [loans] = await conn.execute(
    //     'SELECT * FROM Loan'
    // );

    // console.log('\nLoans in the database:');
    // console.table(loans);

    //     await conn.end();
}

main().catch(err => {
    console.error('Connection failed:', err.message);
});
