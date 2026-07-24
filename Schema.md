### Library Card Schema
---
| Card ID | Member ID | Activation Date |
|---------|-----------|-----------------|
|    PK   | FK → Member |                 |

### Book Schema
---
| Book ID | Author First Name | Author Last Name | Genre | Total No. of Copies | Available No. of Copies |
|---------|-------------------|------------------|-------|---------------------|-------------------------|
|    PK     |                   |                  |       |                     |                         |


### Reservation Schema
---
| Reservation ID | Member ID | Book ID | Reservation Date | Reservation Status |
|----------------|-----------|---------|------------------|--------------------|
| PK | FK → Member ID | FK → Book ID | | |

### Loan Schema
---
| Loan ID | Staff ID | Member ID | Book ID | Reservation ID | Loan Date | Due Date | Return Date | Loan Status |
|---------|----------|-----------|---------|----------------|-----------|----------|-------------|-------------|
| PK | FK → Staff ID | FK → Member ID | FK → Book ID | FK → Reservation ID (Nullable) | | | Nullable | |

### Staff Schema
---
| staff ID | First Name | Last Name |  
|---------|-------------------|------------------| 
|   PK      |                                      

### Member Schema
---
| Member ID | First Name | Last Name | Email | Phone Noumber |
|---------|--------------|-----------|-------|----------------| 
| PK      | 
 
