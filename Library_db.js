// Library_db.js — Library Management System
// Run with: node Library_db.js
// Requires: npm install mysql2 dotenv
// Requires a .env file in the same folder.

require('dotenv').config();
const mysql = require('mysql2/promise');
const prompt = require('prompt-sync')();
const readline = require('readline');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

function printMenu() {
    console.log(`
========= Library Management System =========
1) View all books
2) Search for a book
3) View available books only
4) Register a new member
5) Issue a library card to a member
6) Check out a book
7) Return a book
8) Reserve a book (when unavailable)
9) View a member's loan history
10) View overdue loans
0) Exit
===============================================`);
}
// Book searching options
async function bookSearchMenu(conn) {
    console.log("\nHow would you like to search for the book:\n");
    console.log(`1) By Title
2) By Author
3) By Genre`);
}
// Option 1: View all books
async function viewAllBooks(conn) {
    const [books] = await conn.execute('SELECT * FROM Book');
    if (books.length === 0) {
        console.log("No books in the library.");
        return;
    }
    console.log('\nBooks in the library:');
    console.table(books);
}
// Option 2: Search for a book
async function searchForBook(conn) {
    bookSearchMenu(conn);
    var searchOption = prompt("Enter your choice: ");
    if (searchOption == "1") {
        var bookTitle = prompt("What is the title of the book: ");
        const [books] = await conn.execute(
            'SELECT * FROM Book WHERE title = ?',
            [bookTitle]
        );
        if (books.length === 0) {
        console.log("\nThere are no books that have such title in the library.");
        return;
        }
        console.log('\nHere are the books in the library with that title:');
        console.table(books);
    } else if (searchOption == "2") {
        var authorFN = prompt("What is the author's first name: ");
        var authorLN = prompt("What is the author's last name: ");
        const [books] = await conn.execute(
            'SELECT * FROM Book WHERE author_first_name = ? AND author_last_name = ?',
            [authorFN, authorLN]
        );
        if (books.length === 0) {
        console.log("\nThere are no books that were written by that author in the library.");
        return;
        }
        console.log('\nHere are the books in the library written by that author:');
        console.table(books);
    } else {
        var bookGenre = prompt("What is the genre of the book: ");
        const [books] = await conn.execute(
            'SELECT * FROM Book WHERE genre = ?',
            [bookGenre]
        );
        if (books.length === 0) {
        console.log("\nThere are no books classified under that genre in the library.");
        return;
        }
        console.log('\nHere are the books in the library that are under that genre:');
        console.table(books);
    }
    return;
}
// Option 3: View available books only
async function viewAllAvailableBook(conn){
    const [availableBooks] = await conn.execute(
        'SELECT * FROM Book WHERE available_copies > 0'
    );
    if (availableBooks.length === 0) {
        console.log("\nNo available books in the library.");
        return;
    }
    console.log("\nAvailable books in the library:");
    console.table(availableBooks);
}

// ---------------- 4. Register a new member ----------------
async function registerMember(conn) {
    const firstName = await ask('First name: ');
    const lastName = await ask('Last name: ');
    const email = await ask('Email: ');
    const phone = await ask('Phone number: ');

    const [result] = await conn.execute(
        'INSERT INTO Member (first_name, last_name, email, phone_no) VALUES (?, ?, ?, ?)',
        [firstName, lastName, email, phone]
    );
    console.log(`Member registered with ID ${result.insertId}. (They'll need a library card next — option 5.)`);
}

// ---------------- 5. Issue a library card ----------------
async function issueLibraryCard(conn) {
    const memberId = await ask('Member ID to issue a card to: ');

    const [memberRows] = await conn.execute(
        'SELECT member_id FROM Member WHERE member_id = ?', [memberId]
    );
    if (memberRows.length === 0) {
        console.log('No member found with that ID. Double check the member_id and try again.');
        return;
    }

    const [result] = await conn.execute(
        'INSERT INTO Library_Card (member_ID) VALUES (?)', [memberId]
    );
    console.log(`Library card issued: card_id ${result.insertId} for member ${memberId}.`);
}

// ---------------- 6. Check out a book ----------------
async function checkOutBook(conn) {
    const cardId = await ask('Card ID checking out the book: ');
    const bookId = await ask('Book ID: ');
    const staffId = await ask('Staff ID (processing this checkout): ');
    const dueDate = await ask('Due date (YYYY-MM-DD): ');

    const [bookRows] = await conn.execute(
        'SELECT available_copies FROM Book WHERE book_ID = ?', [bookId]
    );
    if (bookRows.length === 0) {
        console.log('No book found with that ID.');
        return;
    }
    if (bookRows[0].available_copies <= 0) {
        console.log('Sorry, no copies of this book are currently available.');
        return;
    }

    await conn.execute(
        `INSERT INTO Loan (staff_id, card_id, book_id, loan_date, due_date, loan_status)
         VALUES (?, ?, ?, CURDATE(), ?, 'Checked Out')`,
        [staffId, cardId, bookId, dueDate]
    );
    await conn.execute(
        'UPDATE Book SET available_copies = available_copies - 1 WHERE book_ID = ?', [bookId]
    );

    console.log('Book checked out successfully.');
}

// ---------------- 7. Return a book (teammate's logic) ----------------
async function returnBook(conn) {
    const loanId = await ask('Loan ID to return: ');

    const [loans] = await conn.execute(
        `SELECT loan_id, book_id, loan_status FROM Loan WHERE loan_id = ?`,
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
            `UPDATE Loan SET return_date = CURRENT_DATE(), loan_status = 'Returned' WHERE loan_id = ?`,
            [loanId]
        );
        await conn.execute(
            `UPDATE Book SET available_copies = LEAST(available_copies + 1, total_copies) WHERE book_id = ?`,
            [loans[0].book_id]
        );
        await conn.commit();
        console.log('Book returned successfully.');
    } catch (error) {
        await conn.rollback();
        throw error;
    }
}

// ---------------- 8. Reserve a book (teammate's logic) ----------------
async function reserveBook(conn) {
    const cardId = await ask('Card ID making the reservation: ');
    const bookId = await ask('Book ID to reserve: ');

    const [books] = await conn.execute(
        `SELECT available_copies FROM Book WHERE book_id = ?`, [bookId]
    );
    if (books.length === 0) {
        console.log('Book not found.');
        return;
    }
    if (books[0].available_copies > 0) {
        console.log('Book is available. No reservation needed.');
        return;
    }

    await conn.execute(
        `INSERT INTO Reservation (card_id, book_id, reservation_date, reservation_status)
         VALUES (?, ?, CURRENT_DATE(), 'Reserved')`,
        [cardId, bookId]
    );
    console.log('Book reserved successfully.');
}

// ---------------- 9. View a member's loan history (teammate's logic) ----------------
async function viewLoanHistory(conn) {
    const cardId = await ask('Card ID to view history for: ');

    const [history] = await conn.execute(
        `SELECT l.loan_id, b.title, l.loan_date, l.due_date, l.return_date, l.loan_status
         FROM Loan l
         JOIN Book b ON l.book_id = b.book_id
         WHERE l.card_id = ?
         ORDER BY l.loan_date DESC`,
        [cardId]
    );

    if (history.length === 0) {
        console.log('No loan history found for this library card.');
        return;
    }
    console.log(`\nLoan history for card ${cardId}:`);
    console.table(history);
}

// ---------------- 10. View overdue loans (teammate's logic) ----------------
async function viewOverdueLoans(conn) {
    const [overdue] = await conn.execute(
        `SELECT l.loan_id, b.title, l.card_id, l.due_date, l.loan_status
         FROM Loan l
         JOIN Book b ON l.book_id = b.book_id
         WHERE l.due_date < CURRENT_DATE() AND l.loan_status = 'Checked Out'`
    );

    if (overdue.length === 0) {
        console.log('\nNo overdue loans found.');
        return;
    }
    console.log('\nOverdue loans:');
    console.table(overdue);
}

// ---------------- Main menu loop ----------------
async function main() {
    const conn = await mysql.createConnection(dbConfig);
    console.log('Connected to Library_System database.');

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
                await conn.end();
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
    }
    let running = true;
    while (running) {
        printMenu();
        const choice = await ask('Choose an option: ');

        try {
            switch (choice.trim()) {
                case '1': await viewAllBooks(conn); break;
                case '2': await searchForBook(conn); break;
                case '3': await viewAllAvailableBook(conn); break;
                case '4': await registerMember(conn); break;
                case '5': await issueLibraryCard(conn); break;
                case '6': await checkOutBook(conn); break;
                case '7': await returnBook(conn); break;
                case '8': await reserveBook(conn); break;
                case '9': await viewLoanHistory(conn); break;
                case '10': await viewOverdueLoans(conn); break;
                case '0':
                    running = false;
                    console.log('Goodbye!');
                    break;
                default:
                    console.log('Not a valid option, try again.');
            }
        } catch (err) {
            console.log('Something went wrong: ' + err.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Something went wrong:', err.message);
        rl.close();
        process.exit(1);
    });