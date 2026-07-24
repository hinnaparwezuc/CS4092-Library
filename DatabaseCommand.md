-- Create database

CREATE DATABASE IF NOT EXISTS Library_System;

USE Library_System;

-- Create tables

CREATE TABLE Reservation (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_status VARCHAR(30) NOT NULL
);

CREATE TABLE Loan (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    member_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_id INT,
    loan_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    loan_status VARCHAR(30) NOT NULL
);


-- Add foreign keys
