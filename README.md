# 🏢 Rent Management System - Complete Guide

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Updated:** December 2025

A full-stack rent management platform built with **React + Vite**, **Node.js + Express**, and **MongoDB**. Manage tenants, track rent payments, handle complaints, and send automated emails.

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker & Docker Compose (recommended)
- Or: Node.js 18+, MongoDB locally

### Option 1: Docker (Easiest)
```bash
cd rent-management
docker compose up -d
```

**Access:**
- Frontend: http://localhost:5000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

### Option 2: Local Setup
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 📋 Features

### ✅ Core Features
- **Tenant Management** - Add, edit, delete, view all tenants
- **Rent Tracking** - Create due dates, mark payments, track history
- **Payment Methods** - Online, bank transfer, cash, cheque
- **Late Fees** - Auto-calculate 2% late fee after due date
- **Complaint System** - File and resolve maintenance issues
- **Notices** - Admin posts notices visible to all users

### ✅ Role-Based Access
- **Admin Dashboard** - Full control, analytics, all management features
- **Tenant Portal** - View rent dues, pay rent, file complaints

### ✅ Email Service (SMTP)
- Welcome email on tenant creation
- Rent reminders when dues created
- Payment confirmation receipts
- Configurable for Gmail, Outlook, SendGrid, etc.

### ✅ Responsive Design
- Desktop, tablet, mobile optimized
- Sidebar collapses on mobile
- Horizontal scroll for tables
- Touch-friendly buttons

---

## 🏗️ Tech Stack

**Frontend:**
- React 18 + Vite (blazing fast dev server)
- Context API for state management
- CSS with responsive breakpoints
- Axios for API calls

**Backend:**
- Node.js + Express
- MongoDB + Mongoose (ODM)
- JWT authentication
- Nodemailer for email
- CORS enabled for security

**DevOps:**
- Docker & Docker Compose
- MongoDB container (mongo:7.0)
- Multi-stage build for optimized image

---

## 📂 Project Structure

```
rent-management/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── pages/              # All page components
│   │   ├── components/         # Sidebar, Navbar, etc.
│   │   ├── context/            # Auth & Tenant context
│   │   ├── utils/              # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css          # Responsive styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Node + Express API
│   ├── controllers/            # Business logic
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth, error handling
│   ├── config/                 # DB, logger config
│   ├── utils/                  # Email, token helpers
│   ├── server.js               # Express app entry
│   ├── package.json
│   ├── .env.example            # Template
│   └── .env.production         # Production template
│
├── docker-compose.yml          # Multi-container setup
├── Dockerfile                  # Frontend + Backend build
├── EMAIL_SETUP.md              # Email configuration
└── README.md                   # This file
```

---

## 🔐 Environment Setup

### Backend (.env)

Create `backend/.env` with:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (Docker MongoDB)
MONGO_URI=mongodb://admin:admin123@localhost:27017/rent-management?authSource=admin

# JWT (generate: openssl rand -hex 32)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Email (optional - see EMAIL_SETUP.md)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM_NAME=Rent Management
```

### Frontend (.env)

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎮 Using the Application

### Create Admin Account

```bash
# Via API (using Thunder Client or curl):
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin",
  "email": "admin@example.com",
  "phone": "9999999999",
  "password": "SecurePassword123",
  "role": "admin"
}
```

### Login & Navigate

1. Go to `http://localhost:5000`
2. Register or login
3. **Admins** → Admin Dashboard with all management features
4. **Tenants** → Tenant Portal to view and pay rent

### Create Test Tenant

1. Admin logs in
2. Go to "Add Tenant"
3. Fill details (auto-sends welcome email if SMTP configured)
4. Create rent due → Tenant receives reminder
5. Tenant marks payment → Tenant receives confirmation

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register user (creates tenant if role=tenant)
POST   /api/auth/login         # Login & get JWT token
GET    /api/auth/profile       # Get current user (requires token)
```

### Tenants (Admin)
```
GET    /api/tenants            # List all tenants
POST   /api/tenants            # Create tenant
GET    /api/tenants/:id        # Get tenant details
PUT    /api/tenants/:id        # Update tenant
DELETE /api/tenants/:id        # Delete tenant
GET    /api/tenants/me         # Get current tenant profile
```

### Rent Payments
```
GET    /api/rents              # List rent records
POST   /api/rents              # Create rent due (admin)
POST   /api/rents/self         # Create payment entry (tenant)
PUT    /api/rents/:id/pay      # Mark rent as paid
GET    /api/rents/:id          # Get rent details
DELETE /api/rents/:id          # Delete rent (admin)
```

### Complaints
```
GET    /api/complaints         # List all (admin) / own (tenant)
POST   /api/complaints         # File complaint (tenant)
PUT    /api/complaints/:id     # Update status (admin)
PUT    /api/complaints/:id/resolve  # Mark resolved (admin)
```

### Notices
```
GET    /api/notices            # List all notices
POST   /api/notices            # Create notice (admin)
DELETE /api/notices/:id        # Delete notice (admin)
```

### Email Service
```
POST   /api/email/test         # Test email (admin)
POST   /api/email/reminders/all # Send bulk reminders (admin)
```

---

## 📧 Email Configuration

SMTP is optional but recommended. To enable:

1. Get credentials from email provider (Gmail, Outlook, SendGrid, etc.)
2. Update `backend/.env` with MAIL_* variables
3. See `EMAIL_SETUP.md` for detailed instructions per provider

**Emails Sent:**
- ✉️ Welcome email when tenant created
- ✉️ Rent reminder when due date created
- ✉️ Payment confirmation when rent marked paid

---

## 🐛 Bug Fixes & QA

### Issues Fixed (Latest Update)
- ✅ Fixed `adminOnly` middleware reference (should be `admin`)
- ✅ Added proper import for email routes
- ✅ Responsive layout for mobile/tablet
- ✅ Error handling in all controllers
- ✅ Email service graceful fallback
- ✅ Input validation on forms
- ✅ Late fee calculation
- ✅ Tenant auto-creation on user registration

### Testing Checklist
- ✅ Register admin & tenant
- ✅ Login with both roles
- ✅ Create rent due → Check email
- ✅ Mark payment → Check confirmation email
- ✅ File complaint & resolve
- ✅ Post notice
- ✅ Test on mobile viewport
- ✅ Test table scroll on small screens

---

## 🚀 Deployment

### Docker Production Build
```bash
docker build -t rent-management .
docker run -p 5000:5000 --env-file .env rent-management
```

### Cloud Deployment
See deployment guides for:
- **Render** - Easiest for beginners
- **DigitalOcean** - More control
- **AWS** - Professional hosting
- **Azure** - Enterprise option

Documents in root folder with setup steps for each.

---

## 🔒 Security Best Practices

✅ **Implemented:**
- JWT token authentication
- Password hashing with bcrypt
- CORS enabled (configure CORS_ORIGIN in .env)
- Environment variables for secrets
- Role-based access control
- Protected routes (admin-only endpoints)

🔐 **For Production:**
- Change JWT_SECRET to random 32+ char string
- Use HTTPS (not HTTP)
- Set NODE_ENV=production
- Use MongoDB Atlas (not local DB)
- Enable CORS_ORIGIN to your domain only
- Use SendGrid/Mailgun (not Gmail for bulk email)
- Set rate limiting

---

## 🛠️ Troubleshooting

### Docker Issues

**Containers not starting:**
```bash
docker compose logs rent-management-api
docker compose logs rent-management-db
```

**Port already in use:**
```bash
# Change PORT in docker-compose.yml
# Or kill process on port 5000:
lsof -i :5000  # Find process
kill -9 <PID>
```

### Email Issues

**Emails not sending:**
1. Check MAIL_* variables in `.env`
2. Gmail: Use App Password, not account password
3. Restart containers after changing `.env`
4. Check Docker logs: `docker logs rent-management-api`

### Frontend Issues

**API calls failing:**
1. Check backend is running: `http://localhost:5000/api/health`
2. Check VITE_API_URL in frontend `.env`
3. Check browser console for CORS errors

**Styles not loading:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Rebuild frontend: `npm run build`

---

## 📊 Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: "admin" | "tenant",
  createdAt: Date
}
```

### Tenants
```javascript
{
  userId: ObjectId (User),
  name: String,
  email: String,
  phone: String,
  roomNumber: String,
  rentAmount: Number,
  leaseStart: Date,
  leaseEnd: Date,
  securityDeposit: Number,
  notes: String,
  isRegistered: Boolean
}
```

### Rent Payments
```javascript
{
  tenant: ObjectId (Tenant),
  month: String (YYYY-MM),
  amount: Number,
  dueDate: Date,
  paidOn: Date,
  method: "online" | "bank" | "cash" | "cheque",
  status: "pending" | "paid" | "late",
  lateFee: Number,
  notes: String
}
```

---

## 📝 API Response Format

### Success Response (200)
```json
{
  "status": "success",
  "data": { /* resource data */ }
}
```

### Error Response (400/401/500)
```json
{
  "message": "Error description",
  "stack": "Stack trace (dev only)"
}
```

---

## 📞 Support

- **Documentation:** See markdown files in root
- **Email Setup:** `EMAIL_SETUP.md`
- **Deployment:** `DEPLOYMENT_GUIDE.md` (if exists)
- **Issues:** Check browser console & Docker logs

---

## 📄 License

MIT License - Free to use and modify

---

## 🎉 You're All Set!

```bash
# Start the app
docker compose up -d

# Open in browser
# Frontend: http://localhost:5000
# API: http://localhost:5000/api
# Health check: http://localhost:5000/api/health

# Enjoy! 🚀
```

---

**Built with ❤️ using React, Node.js, and MongoDB**
