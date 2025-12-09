# ⚡ Quick Start Guide

## Setup (5 Minutes)

### 1. Database Setup
```sql
CREATE DATABASE dorm_db;
```

### 2. Environment Configuration
Edit `Dorm-Backend/.env`:
```env
DB_NAME=dorm_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-here
```

### 3. Install & Run
```bash
# Install all dependencies
npm run install:all

# Create admin user
npm run create-admin

# Start application
npm run dev
```

## 🎯 Using the System

### Login
Visit `http://localhost:5173` → Redirects to login page

### Navigation
- **Units** - View all dormitory units
- **Tenants** - Manage tenant information
- **Payments** - Monitor payment status
- **Payment History** - View all payment records
- **Settings** - User management & system config

### Key Features

**Payments Page:**
- View payment statistics (Total Collected, Due Today, Overdue)
- Filter by status (All, Unpaid, Overdue, Paid)
- Update payment status
- Search payments

**Settings Page:**
- **User Management Tab:**
  - View all staff users
  - Create/Edit/Delete users (Admin only)
  - Change user roles
  - Update user status

- **System Information Tab:**
  - Configure system name, version
  - Update contact information
  - Set address

## 🔧 Troubleshooting

**Database connection failed?**
- Check MySQL is running
- Verify `.env` credentials

**Can't login?**
- Clear browser localStorage
- Create new admin: `npm run create-admin`

**Payment data not loading?**
- Check backend is running on port 5000
- Verify JWT token in localStorage

## 📞 Support

Check `API_DOCUMENTATION.md` for API details or review server logs for errors.

---

**Ready to use!** 🚀

