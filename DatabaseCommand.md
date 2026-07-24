## Create database

```sql
CREATE DATABASE IF NOT EXISTS Library_System;

USE Library_System;
```

## Create tables
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

 
