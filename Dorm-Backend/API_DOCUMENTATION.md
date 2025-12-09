# Dorm Management System - API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Tenant Management](#tenant-management)
4. [Unit Management](#unit-management)
5. [Payment Management](#payment-management)
6. [Error Handling](#error-handling)

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "phone": "09123456789",
  "role": "staff"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "staff",
    "status": "active"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "staff",
    "status": "active",
    "lastLogin": "2025-12-07T10:30:00.000Z"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe Jr.",
  "phone": "09987654321"
}
```

### Change Password
```http
PUT /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword123"
}
```

---

## User Management

### Get All Users
```http
GET /api/users
Authorization: Bearer <token>

Query Parameters:
- role: Filter by role (admin, staff, manager)
- status: Filter by status (active, inactive, suspended)
```

### Create User (Admin Only)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newstaff",
  "email": "staff@example.com",
  "password": "password123",
  "fullName": "New Staff Member",
  "role": "staff",
  "phone": "09123456789"
}
```

### Update User Role (Admin Only)
```http
PUT /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "manager"
}
```

---

## Tenant Management

### Get All Tenants
```http
GET /api/tenants
Authorization: Bearer <token>
```

### Create Tenant
```http
POST /api/tenants
Authorization: Bearer <token>
Content-Type: application/json

{
  "unit": "101",
  "fullName": "Lance Atendidas",
  "phone": "09123456789",
  "email": "lance@example.com",
  "address": "123 Main St, City",
  "moveInDate": "2025-01-15",
  "gender": "male",
  "dateOfBirth": "1995-05-20",
  "emergencyContactName": "Jane Atendidas",
  "emergencyContactRelationship": "Sister",
  "emergencyContactPhone": "09987654321",
  "status": "active"
}
```

---

## Unit Management

### Get All Units
```http
GET /api/units
Authorization: Bearer <token>
```

**Response includes tenant count and occupancy status:**
```json
[
  {
    "id": 1,
    "unitNumber": "101",
    "floor": 1,
    "capacity": 2,
    "rentPrice": "10000.00",
    "description": "Spacious unit with balcony",
    "tenantCount": 2,
    "status": "occupied"
  }
]
```

---

## Payment Management

### Get All Payments
```http
GET /api/payments
Authorization: Bearer <token>

Query Parameters:
- status: Filter by status (Paid, Unpaid, Late, Partial)
- paymentType: Filter by type (Rent Bill, Electricity & Water Bill, etc.)
- startDate: Filter by date range start
- endDate: Filter by date range end
```

### Get Payment Statistics
```http
GET /api/payments/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalCollected": "150000.00",
  "dueToday": "25000.00",
  "overdue": "5000.00",
  "statusCounts": [
    { "status": "Paid", "count": 45 },
    { "status": "Unpaid", "count": 8 },
    { "status": "Late", "count": 2 }
  ],
  "recentPayments": [...]
}
```

### Get Overdue Payments
```http
GET /api/payments/overdue
Authorization: Bearer <token>
```

### Get Payments by Tenant
```http
GET /api/payments/tenant/:tenantId
Authorization: Bearer <token>
```

### Get Payments by Unit
```http
GET /api/payments/unit/:unitNumber
Authorization: Bearer <token>
```

### Create Payment
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "tenantId": 1,
  "unitNumber": "101",
  "tenantName": "Lance Atendidas",
  "amount": 10000.00,
  "paymentType": "Rent Bill",
  "paymentDate": "2025-12-01",
  "dueDate": "2025-12-05",
  "status": "Paid",
  "paymentMethod": "GCash",
  "referenceNumber": "GCash-123456789",
  "paidAmount": 10000.00,
  "notes": "December rent payment"
}
```

### Update Payment
```http
PUT /api/payments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Paid",
  "paidAmount": 10000.00,
  "paymentMethod": "Cash",
  "paymentDate": "2025-12-07"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Authentication Errors
```json
{
  "message": "No token provided. Authorization denied."
}
```

```json
{
  "message": "Token expired"
}
```

```json
{
  "message": "Invalid credentials"
}
```

### Authorization Errors
```json
{
  "message": "You do not have permission to perform this action"
}
```

```json
{
  "message": "Admin access required"
}
```

---

## Payment Types
- `Rent Bill`
- `Electricity & Water Bill`
- `Advance`
- `Deposit`
- `Maintenance`
- `Other`

## Payment Status
- `Paid` - Payment completed
- `Unpaid` - Payment not yet made
- `Late` - Payment overdue
- `Partial` - Partial payment made

## Payment Methods
- `Cash`
- `Bank Transfer`
- `GCash`
- `PayMaya`
- `Credit Card`
- `Debit Card`
- `Other`

## User Roles
- `admin` - Full system access
- `manager` - Manage tenants, units, payments
- `staff` - View and update records

## User Status
- `active` - Active user account
- `inactive` - Inactive account
- `suspended` - Suspended account

