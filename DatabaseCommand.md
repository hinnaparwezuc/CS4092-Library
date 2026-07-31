# Create database

```sql
CREATE DATABASE IF NOT EXISTS Library_System;
USE Library_System;
```


## Create tables

### Staff Table
```sql
CREATE TABLE Staff ( 
    staff_id    INT AUTO_INCREMENT PRIMARY KEY, 
    first_name  VARCHAR(50) NOT NULL, 
    last_name   VARCHAR(50) NOT NULL 
); 
```

### Member Table
```sql
CREATE TABLE Member ( 
    member_id   INT AUTO_INCREMENT PRIMARY KEY, 
    first_name  VARCHAR(50) NOT NULL, 
    last_name   VARCHAR(50) NOT NULL, 
    email       VARCHAR(100) UNIQUE, 
    phone_no    VARCHAR(20) 
); 
```

### Library card table 
```sql
CREATE TABLE Library_Card ( 
card_ID INT AUTO_INCREMENT PRIMARY KEY, 
member_ID INT NOT NULL, 
CONSTRAINT fk_member 
FOREIGN KEY (member_ID)  
       		REFERENCES Member(member_id), 
    	activation_date DATE DEFAULT (CURRENT_DATE()) 
);
```

### Book table 
```sql
CREATE TABLE Book ( 
book_ID INT AUTO_INCREMENT PRIMARY KEY, 
author_first_name VARCHAR(50) NOT NULL, 
author_last_name VARCHAR(50) NOT NULL, 
genre VARCHAR(50) NOT NULL, 
total_copies INT NOT NULL, 
available_copies INT NOT NULL 
);
```

### Reservation Table
```sql
CREATE TABLE Reservation (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_status VARCHAR(30) NOT NULL
);
```
### Loan Table
```sql
CREATE TABLE Loan (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    card_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_id INT,
    loan_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    loan_status VARCHAR(30) NOT NULL
);
```

## Add foreign keys
### Foreign key for Reservation Table

```sql
ALTER TABLE Reservation  
ADD CONSTRAINT fk_reservation_member 
FOREIGN KEY (card_id) 
REFERENCES Library_Card(card_id); 

ALTER TABLE Reservation 
ADD CONSTRAINT fk_reservation_book 
FOREIGN KEY (book_id) 
REFERENCES Book(book_id); 
```

### Foreign Key for Reservation Table
```sql
ALTER TABLE Loan 
ADD CONSTRAINT fk_loan_staff 
FOREIGN KEY (staff_id) 
REFERENCES Staff(staff_id); 

ALTER TABLE Loan 
ADD CONSTRAINT fk_loan_member 
FOREIGN KEY (card_id) 
REFERENCES Library_Card(card_id);

ALTER TABLE Loan 
ADD CONSTRAINT fk_loan_book 
FOREIGN KEY (book_id) 
REFERENCES Book(book_id); 

ALTER TABLE Loan 
ADD CONSTRAINT fk_loan_reservation 
FOREIGN KEY (reservation_id) 
REFERENCES Reservation(reservation_id); 
```

## Alter tables

### Altering Book Table to add title
```sql
ALTER TABLE Book
ADD title VARCHAR(100) NOT NULL UNIQUE AFTER book_ID;
```

### Removing the constraint of UNIQUE from Title attribute of Book Table
```sql
ALTER TABLE Book
DROP INDEX title;
```


## Insert Values into Table

### Inserting into the Staff Table
```sql
INSERT INTO Staff (first_name, last_name) 
VALUES ( 'John', 'Doe'), ( 'Neha', 'Rai'), (
        'Hinna', 'Parwezhs'), ( 'Aisha', 'Abdurrahman'); 
```

 ### Inserting into the Member Table
 ```sql
INSERT INTO Member (first_name, last_name, email, phone_no) 
VALUES ('Emily', 'Johnson', 'emily.johnson@email.com', '513-555-0134'),
        ('Michael', 'Brown', 'michael.brown@email.com', '513-555-0187'),
        ('Sarah', 'Davis', 'sarah.davis@email.com', '859-555-0219'),
        ('James', 'Wilson', 'james.wilson@email.com', '937-555-0256'); 
 ```

### Inserting into the Library Card Table
```sql
INSERT INTO Library_Card (member_ID) 
VALUES (1), (2), (3) (4);
```

### Inserting into the Book Table
```sql
INSERT INTO Book (title, author_first_name, author_last_name, genre, total_copies, available_copies) 
VALUES ('A Court of Thorns and Roses', 'Sarah J.', 'Maas', 'Fantasy Action', 20 , 20),
    ('The Kite Runner', 'Khaled', 'Hosseini', 'Historical Fiction', 20 , 20),
    ('A Thousand Splendid Suns','Khaled','Hosseini','Historical Fiction', 5 , 5),
    ('And The Mountains Echoed','Khaled','Hosseini','Historical Fiction', 2 , 2),
    ('Children of Blood and Bone','Tomi','Adeyemi','Fantasy Action', 3, 3),
    ('Elsewhere','Richard','Russo','Memoir', 20, 20),
    ('Elsewhere','Gabrielle','Zevin','Fantasy Fiction', 2, 2),
    ('When the Day Comes','Gabrielle','Meyer','Historical Romance', 10, 10),
    ('Everything I Know About Love','Dolly','Alderton','Memoir', 5, 5),
    ('The Diary of a Young Girl','Anne','Frank','Non-Fiction', 30, 30); 
```

### Inserting into the Reservation Table
```sql
INSERT INTO Reservation (card_id, book _id, reservation_date, reservation_status) 
VALUES (1, 1, ‘2026-07-24', ‘Reserved’); 

INSERT INTO Reservation (card_id, book _id, reservation_date, reservation_status) 
VALUES (2, 2, ‘2026-07-20', ‘Reserved’);

INSERT INTO Reservation (card_id, book _id, reservation_date, reservation_status) 
VALUES (3, 3, ‘2026-07-10', ‘Cancelled’); 

INSERT INTO Reservation (card_id, book _id, reservation_date, reservation_status) 
VALUES (4, 4, ‘2026-07-22', ‘Completed’);
```

### Inserting into the Loan Table
```sql
INSERT INTO Loan (staff_id, card_id, book_id, reservation_id, loan_date, due_date, return_date, loan_status)  
VALUES (1, 1, 1, 1, '2026-07-24', '2026-08-07', NULL, 'Checked Out');  

INSERT INTO Loan (staff_id, card_id, book_id, reservation_id, loan_date, due_date, return_date, loan_status)  
VALUES (2, 2, 2, 2, '2026-07-20', '2026-08-03', NULL, 'Checked Out');  

INSERT INTO Loan (staff_id, card_id, book_id, reservation_id, loan_date, due_date, return_date, loan_status)  
VALUES (3, 3, 3, 3, '2026-07-10', '2026-07-24', '2026-07-22', 'Returned');  

INSERT INTO Loan (staff_id, card_id, book_id, reservation_id, loan_date, due_date, return_date, loan_status)  
VALUES (4, 4, 4, 4, '2026-07-22', '2026-08-05', NULL, 'Checked Out'); 
```
