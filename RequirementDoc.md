### Data Requirements
The Library system must store information about the following:
 
- Staff – staff id(PK), first name, last name  – Neha ER 
- Member – user id(PK), first name, last name  – Neha ER 
- Library Card – card id (PK), user id (FK) – (Aisha, ER) 
- Library – book serial number/id (PK) , no. Of copies, availability – (Aisha, ER) 
- Books – book serial number/id (PK), title, genre, author, total copies, available copies – (Aisha, ER) 
- Reservation – reservation id (PK), member id (FK), book id (FK), reservation date – (Hinna ER) 
- Loan – loan id (PK), member id (FK), book id (FK), loan date, due date, return date, loan status – (Hinna ER) 

### Strong entities: 
Staff, Member, Library Card, Library, Books 

### Relationships: 
Loan, Reserve 


### Use Cases (Staff User):
- Log into the library system
- Register as a staff into the library system
- Staff should be able to check out the books for members  
- Find the available book 
- Register new members 
- Staff should be able to see members current and past loans.
- Search for book 
- View book availability 
- Borrow available book 
- Return borrowed book 
- Reserve unavailable books 
- View all books in library
- Exit out of the library system
  

