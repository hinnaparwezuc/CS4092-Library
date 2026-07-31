// Library_db.js — Library Management System
// Database connection only. Run with: node Library_db.js
// Requires: npm install mysql2 dotenv
// Requires a .env file in the same folder  

require('dotenv').config();
const mysql = require('mysql2/promise');
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
8) Reserve a book                    
9) View a member's loan history        
10) View overdue loans                 
0) Exit
===============================================`);
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


async function main() {
    const conn = await mysql.createConnection(dbConfig);
    console.log('Connected to library_system database.');

let running = true;



    while (running) {
        printMenu();
        const choice = await ask('Choose an option: ');
 
         try {
        switch (choice.trim()) {
            case '4': await registerMember(conn); break;
            case '5': await issueLibraryCard(conn); break;
            case '6': await checkOutBook(conn); break;
            case '1': case '2': case '3': case '7': case '8': case '9': case '10':
                console.log('This option is being added by a teammate — not ready yet.');
                break;
            case '0':
                running = false;
                console.log('Goodbye!');
                break;
            default:
                console.log('Not a valid option, try again.');
        }
    }catch (err) {
            console.log('Something went wrong: ' + err.message);
        }
    }



    await conn.end();
}

main().catch(err => {
    console.error('Connection failed:', err.message);
});
