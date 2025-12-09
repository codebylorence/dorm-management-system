# Dorm Management System - Backend

Backend API for the Dorm Management System built with Node.js, Express, and Sequelize ORM.

## Features

- ✅ User Authentication & Authorization (JWT)
- ✅ Tenant Management
- ✅ Unit Management
- ✅ Payment Management & History
- ✅ Role-Based Access Control (Admin, Manager, Staff)
- ✅ RESTful API Architecture

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your database in `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dorm_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h
```

3. Make sure MySQL is running and the database `dorm_db` exists

4. Start the server:
```bash
npm run dev
```

The server will run on http://localhost:5000

## First Time Setup

Create an admin user to access the system:

```bash
npm run create-admin
```

Follow the prompts to create your first admin account.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user (authenticated)
- `GET /me` - Get current user (authenticated)
- `PUT /profile` - Update profile (authenticated)
- `PUT /password` - Change password (authenticated)
- `POST /refresh` - Refresh token (authenticated)

### Users (`/api/users`) - Requires Authentication
- `GET /` - Get all users
- `GET /:id` - Get user by ID
- `POST /` - Create new user (admin only)
- `PUT /:id` - Update user
- `PUT /:id/role` - Update user role (admin only)
- `DELETE /:id` - Delete user (admin only)

### Tenants (`/api/tenants`) - Requires Authentication
- `GET /` - Get all tenants
- `GET /:id` - Get tenant by ID
- `POST /` - Create new tenant
- `PUT /:id` - Update tenant
- `DELETE /:id` - Delete tenant

### Units (`/api/units`) - Requires Authentication
- `GET /` - Get all units
- `GET /:id` - Get unit by ID
- `POST /` - Create new unit
- `PUT /:id` - Update unit
- `DELETE /:id` - Delete unit

### Payments (`/api/payments`) - Requires Authentication
- `GET /` - Get all payments (with filtering)
- `GET /statistics` - Get payment statistics
- `GET /overdue` - Get overdue payments
- `GET /:id` - Get payment by ID
- `GET /tenant/:tenantId` - Get payments by tenant
- `GET /unit/:unitNumber` - Get payments by unit
- `POST /` - Create new payment
- `PUT /:id` - Update payment
- `DELETE /:id` - Delete payment

## Database Models

### User
- id, username, email, password (hashed), fullName, role, status, phone, lastLogin, profilePicture

### Tenant
- id, unit, fullName, phone, email, address, moveInDate, gender, dateOfBirth, emergencyContacts, status

### Unit
- id, unitNumber, floor, capacity, rentPrice, description

### Payment
- id, tenantId, unitNumber, tenantName, amount, paymentType, paymentDate, dueDate, status, paymentMethod, referenceNumber, paidAmount, notes

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Configuration

- Database: dorm_db
- ORM: Sequelize
- Dialect: MySQL
- Auto-sync: Enabled (alter mode)
