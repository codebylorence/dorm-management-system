# 🏠 Dorm Management System

Full-stack dormitory management system with authentication, payment tracking, tenant management, and user administration.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Database
Edit `Dorm-Backend/.env`:
```env
DB_NAME=dorm_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

### 3. Create Admin User
```bash
npm run create-admin
```

### 4. Start Application
```bash
npm run dev
```

Access at: `http://localhost:5173`

## ✨ Features

- 🔐 **Authentication** - JWT-based login system
- 💰 **Payment Management** - Track payments, view statistics, monitor overdue
- 👥 **Tenant Management** - Complete tenant profiles
- 🏢 **Unit Management** - Track occupancy and capacity
- 👨‍💼 **User Management** - Admin panel for staff accounts
- ⚙️ **Settings** - System configuration and user management

## 📦 Tech Stack

**Frontend:** React, Vite, Tailwind CSS  
**Backend:** Node.js, Express, Sequelize, MySQL  
**Auth:** JWT, Bcrypt

## 📂 Project Structure

```
dorm-management-system/
├── Dorm-Backend/     # API server
├── Dorm-Frontend/    # React app
└── package.json      # Root scripts
```

## 🎯 Available Scripts

- `npm run dev` - Start both backend and frontend
- `npm run install:all` - Install all dependencies
- `npm run create-admin` - Create admin user

## 📚 Documentation

- `API_DOCUMENTATION.md` - API endpoint reference
- Backend docs in `Dorm-Backend/README.md`

## 🔐 Default Access

After creating admin user, login at `/login` with your credentials.

**Roles:** Admin (full access), Manager, Staff

---

**Version:** 1.0.0 | **Status:** Production Ready ✅
