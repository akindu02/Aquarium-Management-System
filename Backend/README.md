# 🐠 Aquarium Management System - Backend API

A robust Node.js & Express.js backend API for the Aquarium Management System with JWT-based authentication, role-based access control, and PostgreSQL database.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Sample Requests](#-sample-requests)

---

## ✨ Features

- **User Authentication** - Register, login, logout with JWT tokens
- **Secure Password Handling** - bcrypt hashing with strength validation
- **Token Management** - Access tokens (7 days) + Refresh tokens (30 days)
- **Role-Based Access Control** - Customer, Supplier, Staff, and Admin roles
- **Input Validation** - Express-validator for request sanitization
- **PostgreSQL Database** - Connection pooling for optimal performance
- **Health Checks** - Server and database health monitoring endpoints

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **PostgreSQL** | Database |
| **pg** | PostgreSQL client |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **express-validator** | Input validation |
| **cors** | Cross-origin resource sharing |
| **dotenv** | Environment configuration |
| **nodemon** | Development hot-reload |

---

## 📁 Project Structure

```
Backend/
├── config/
│   └── db.js               # PostgreSQL connection pool configuration
│
├── controllers/
│   └── authController.js   # HTTP request/response handlers
│
├── db/
│   ├── schema.sql          # Database table definitions
│   ├── seed.sql            # Sample data for testing
│   └── init.js             # Database initialization script
│
├── middleware/
│   └── authMiddleware.js   # JWT authentication & role authorization
│
├── routes/
│   └── authRoutes.js       # Auth API route definitions
│
├── services/
│   └── authService.js      # Business logic layer
│
├── utils/
│   ├── passwordUtils.js    # Password hashing & validation utilities
│   └── jwtUtils.js         # JWT token utilities
│
├── .env                    # Environment variables (not in git)
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
├── server.js               # Application entry point
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Navigate to the Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the Backend directory (see [Environment Variables](#-environment-variables))

4. **Initialize the database**
   ```bash
   # Create tables only
   npm run db:init
   
   # Create tables + seed sample data
   npm run db:init -- --seed
   ```

5. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

6. **Verify the server is running**
   
   Visit `http://localhost:5000/api/health`

---

## 🔐 Environment Variables

Create a `.env` file in the Backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

> ⚠️ **Important**: Never commit the `.env` file to version control. Update `JWT_SECRET` with a strong, unique secret in production.

---

## 🗄 Database Setup

### Tables Created

| Table | Description |
|-------|-------------|
| `users` | User accounts with roles |
| `refresh_tokens` | JWT refresh token storage |
| `password_reset_tokens` | Password reset functionality |

### User Roles

| Role | Description |
|------|-------------|
| `customer` | Customers who purchase products/services (default) |
| `supplier` | Suppliers who provide fish, equipment, supplies |
| `staff` | Staff members who manage day-to-day operations |
| `admin` | Full system access and administration |

### Sample Users (after seeding)

| Email | Password | Role |
|-------|----------|------|
| `admin@aquarium.com` | `Password123!` | admin |
| `staff@aquarium.com` | `Password123!` | staff |
| `supplier@aquarium.com` | `Password123!` | supplier |
| `customer@aquarium.com` | `Password123!` | customer |

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health status |
| `GET` | `/api/health/db` | Database connection status |

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and get tokens | ❌ |
| `POST` | `/api/auth/refresh-token` | Refresh access token | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update user profile | ✅ |
| `PUT` | `/api/auth/change-password` | Change password | ✅ |
| `POST` | `/api/auth/logout` | Logout (invalidate refresh token) | ✅ |
| `POST` | `/api/auth/logout-all` | Logout from all devices | ✅ |

---

## 🔑 Authentication

### Token Flow

1. **Login/Register** → Receive `accessToken` and `refreshToken`
2. **API Requests** → Include `accessToken` in Authorization header
3. **Token Expired** → Use `refreshToken` to get new `accessToken`
4. **Logout** → Invalidate `refreshToken`

### Using Tokens

Include the access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

---

## ⚠️ Error Handling

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Optional: validation errors
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (invalid/missing token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## 📝 Sample Requests

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer",
    "isActive": true,
    "emailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile (Protected)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_access_token>"
```

### Update Profile

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1987654321"
  }'
```

### Change Password

```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<your_refresh_token>"
  }'
```

### Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{
    "refreshToken": "<your_refresh_token>"
  }'
```

---

## 🧪 PowerShell Examples

For Windows users using PowerShell:

```powershell
# Register
$body = @{
  email = "test@example.com"
  password = "Test123!@#"
  firstName = "Test"
  lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST -Body $body -ContentType "application/json"

# Login
$body = @{
  email = "test@example.com"
  password = "Test123!@#"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST -Body $body -ContentType "application/json"

# Save token
$token = $response.accessToken

# Get Profile
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
  -Method GET -Headers @{ Authorization = "Bearer $token" }
```

---

## 📚 Middleware Usage

### Available Middleware

| Middleware | Description |
|------------|-------------|
| `authenticate` | Verifies JWT token, attaches user to request |
| `authorize(...roles)` | Checks if user has one of the specified roles |
| `adminOnly` | Only allows admin users |
| `staffOnly` | Only allows staff users |
| `staffOrAdmin` | Allows staff and admin (internal employees) |
| `supplierOnly` | Only allows supplier users |
| `customerOnly` | Only allows customer users |
| `internalOnly` | Only allows admin and staff (employees) |
| `externalOnly` | Only allows customers and suppliers |
| `optionalAuth` | Attaches user if token valid, but doesn't require it |

### Protect Routes

```javascript
const { 
  authenticate, 
  authorize, 
  adminOnly, 
  staffOrAdmin,
  supplierOnly,
  customerOnly,
  internalOnly 
} = require('./middleware/authMiddleware');

// Any authenticated user
router.get('/profile', authenticate, getProfile);

// Admin only
router.delete('/users/:id', authenticate, adminOnly, deleteUser);

// Staff or Admin (internal employees)
router.put('/inventory', authenticate, staffOrAdmin, updateInventory);

// Suppliers only
router.post('/supply-orders', authenticate, supplierOnly, createSupplyOrder);

// Customers only
router.post('/orders', authenticate, customerOnly, createOrder);

// Internal staff only (admin + staff)
router.get('/reports', authenticate, internalOnly, getReports);

// Specific roles using authorize
router.get('/analytics', authenticate, authorize('admin', 'staff', 'supplier'), getAnalytics);
```

---

## 📄 License

This project is part of the Aquarium Management System.

---

## 🤝 Contributing

1. Follow the existing code structure
2. Use meaningful commit messages
3. Test your changes before submitting

---

Made with ❤️ for the Aquarium Management System
