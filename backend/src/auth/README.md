# Authentication Module

This module implements authentication in the NestJS application using Passport.js and JWT with bcrypt password hashing.

## Features Implemented

1. **User Model** with:
   - Email (unique)
   - Password (hashed with bcrypt)
   - Name fields
   - Role field (default 'user')

2. **Authentication Strategies**:
   - Local Strategy for email/password login
   - JWT Strategy for token-based authentication

3. **Endpoints**:
   - POST `/auth/login` - Login with email and password
   - POST `/auth/register` - Register new user

4. **Security Features**:
   - Passwords hashed with bcrypt
   - JWT tokens with expiration
   - Admin guard for protected routes
   - Admin middleware for route protection

5. **Guard Implementation**:
   - JwtAuthGuard - Protects routes requiring valid JWT
   - AdminGuard - Protects admin-only routes

## Usage

### Register a new user:
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### Login:
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Protected routes (using JWT):
```http
GET /protected-route
Authorization: Bearer <jwt-token>
```

### Admin-only routes (using AdminGuard):
```http
GET /admin-route
Authorization: Bearer <admin-jwt-token>
```