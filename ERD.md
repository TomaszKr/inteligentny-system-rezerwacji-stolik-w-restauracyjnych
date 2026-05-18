# Diagram ERD - Baza danych systemu rezerwacji stolików

## Tabele

### 1. Restaurants
- id (PK)
- name (varchar(255))
- address (varchar(255))
- phone (varchar(100))
- email (varchar(255))

### 2. Tables
- id (PK)
- tableNumber (integer)
- capacity (integer)
- restaurantId (FK -> Restaurants.id)

### 3. Users
- id (PK)
- firstName (varchar(100))
- lastName (varchar(100))
- email (varchar(255), unique)
- password (varchar(255))
- phone (varchar(20))

### 4. Reservations
- id (PK)
- reservationTime (timestamp)
- guests (integer)
- userId (FK -> Users.id)
- tableId (FK -> Tables.id)

## Relacje

1. **Restaurants → Tables** (1:N)
   - Jedna restauracja może mieć wiele stolików
   - Klucz obcy: Tables.restaurantId → Restaurants.id

2. **Users → Reservations** (1:N)
   - Jeden użytkownik może mieć wiele rezerwacji
   - Klucz obcy: Reservations.userId → Users.id

3. **Tables → Reservations** (1:N)
   - Jeden stolik może mieć wiele rezerwacji
   - Klucz obcy: Reservations.tableId → Tables.id