# 🚀 Quick Start Guide - New Backend Features

## ✨ What's New?

Your Dorm Management System backend now includes:

### 🔐 Authentication System
- User login/registration with JWT tokens
- Password hashing with bcrypt
- Role-based access control (Admin, Manager, Staff)

### 💰 Payment Management
- Complete payment tracking system
- Payment history with filtering
- Dashboard statistics (total collected, due today, overdue)
- Support for multiple payment types and methods

### 👥 User Management
- Staff user accounts
- Admin panel functionality
- User role management

---

## ⚡ Quick Start (3 Steps)

### Step 1: Configure Environment

Edit `Dorm-Backend/.env` and add:

```env
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRE=24h
```

### Step 2: Create Admin User

```bash
cd Dorm-Backend
npm run create-admin
```

Enter your admin credentials when prompted.

### Step 3: Start the Server

```bash
npm run dev
```

That's it! 🎉

---

## 🧪 Test Your Setup

### Option 1: Use the Test Script

```bash
cd Dorm-Backend
node test-api.js
```

This will run automated tests on your API.

### Option 2: Manual Testing with cURL

**1. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-admin-username","password":"your-password"}'
```

Copy the token from the response.

**2. Get Payment Statistics:**
```bash
curl http://localhost:5000/api/payments/statistics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**3. Get All Tenants:**
```bash
curl http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📱 Frontend Integration

### Payment History Page

Update `Dorm-Frontend/src/Components/subcomp/payhiscards.jsx`:

```javascript
import { useEffect } from 'react';
import { getAllPayments, updatePayment } from '../../api';

// Inside your component:
useEffect(() => {
  const fetchPayments = async () => {
    try {
      const data = await getAllPayments();
      setHistory(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  fetchPayments();
}, []);

const handleStatusChange = async (paymentId, newStatus) => {
  try {
    await updatePayment(paymentId, { status: newStatus });
    // Refresh list
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Login Page

Create a new login component:

```javascript
import { useState } from 'react';
import { login } from './api';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      console.log('Login successful:', response.user);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 📚 Documentation

- **`README.md`** - Complete setup and overview
- **`API_DOCUMENTATION.md`** - Detailed API endpoint documentation
- **`IMPLEMENTATION_SUMMARY.md`** - What was implemented and why

---

## 🔑 Default User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access - can manage users, tenants, units, payments |
| **Manager** | Can manage tenants, units, payments |
| **Staff** | Can view and update records |

---

## 💡 Common Tasks

### Create a New Payment

```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tenantId": 1,
    "amount": 10000,
    "paymentType": "Rent Bill",
    "status": "Unpaid",
    "dueDate": "2025-12-15"
  }'
```

### Get Payment Statistics

```bash
curl http://localhost:5000/api/payments/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Payment Status

```bash
curl -X PUT http://localhost:5000/api/payments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "Paid",
    "paidAmount": 10000,
    "paymentMethod": "Cash"
  }'
```

### Create New Staff User (Admin Only)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "username": "staff1",
    "email": "staff1@example.com",
    "password": "SecurePassword123",
    "fullName": "Staff Member One",
    "role": "staff"
  }'
```

---

## 🗄️ Database Tables

Your database now has these tables:

- ✅ `tenants` (existing)
- ✅ `units` (existing)
- 🆕 `users` (staff/admin accounts)
- 🆕 `payments` (payment records)

All tables are created automatically when you start the server.

---

## 🔍 API Endpoints Summary

### Public Endpoints
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Protected Endpoints (Require Token)
- `GET /api/auth/me` - Current user
- `GET /api/tenants` - List tenants
- `GET /api/units` - List units
- `GET /api/payments` - List payments
- `GET /api/payments/statistics` - Dashboard stats
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment

### Admin Only
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `DELETE /api/users/:id` - Delete user

Full documentation: See `API_DOCUMENTATION.md`

---

## 🛠️ Troubleshooting

### "Database connection failed"
- Check MySQL is running
- Verify `.env` database credentials
- Make sure database `dorm_db` exists

### "Token expired" or "Invalid token"
- Login again to get a new token
- Tokens expire after 24 hours by default

### "You do not have permission"
- Check your user role
- Some endpoints require admin access
- Login with an admin account

### "Tenant not found" when creating payment
- Make sure the tenant exists in the database
- Check the `tenantId` value

---

## 📞 Need Help?

1. Check server logs for errors
2. Review `API_DOCUMENTATION.md` for endpoint details
3. Run `node test-api.js` to verify setup
4. Make sure all environment variables are set

---

## 🎯 Next Steps

1. ✅ Create admin account (`npm run create-admin`)
2. ✅ Start the server (`npm run dev`)
3. ✅ Test authentication (login)
4. ✅ Create test payment
5. ✅ Integrate with frontend components
6. 🔲 Add login page to frontend
7. 🔲 Update payment history to fetch from API
8. 🔲 Add authentication to other components

---

## 📦 Files Modified

**Backend:**
- ✅ 10 new files created
- ✅ 3 files modified
- ✅ 3 packages installed

**Frontend:**
- ✅ 3 new API files created
- ✅ 2 files modified

**Everything is backward compatible!** Your existing tenant and unit data remains unchanged.

---

## 🎉 You're All Set!

Your backend now has:
- ✅ Secure authentication
- ✅ Payment management
- ✅ User management
- ✅ Role-based access control

Start building amazing features! 🚀

