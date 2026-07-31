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

#### Reservation Table
```sql
CREATE TABLE Reservation (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_status VARCHAR(30) NOT NULL
);
```
#### Loan Table
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
#### Foreign key for Reservation Table

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

#### Foreign Key for Reservation Table
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

 

 
