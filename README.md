# MultiVendor RBAC Management System

A full-stack multi-role management platform built using MERN stack with JWT authentication, Role-Based Access Control (RBAC), dynamic field-level permissions, CRUD management, and task assignment workflows.

---

# Features

## Authentication & Security

* JWT Authentication
* bcrypt password hashing
* Protected APIs
* Role-based route protection
* Secure middleware architecture

---

# Roles

## Admin

* Create Managers, Staff, and Users
* Assign dynamic permissions
* View all users
* View all tasks
* Manage records

## Manager

* Create and manage records
* Assign tasks to staff
* View assigned tasks
* Access based on permissions

## Staff

* View assigned tasks
* Update task status
* Submit completion reasons

## User

* Basic dashboard access

---

# Dynamic Permissions

Admin can dynamically control field-level access for managers.

Fields:

* category
* subCategory
* shortDescription
* fullDescription

Frontend and backend both enforce permissions.

---

# Tech Stack

## Frontend

* React.js
* React Router
* Tailwind CSS
* Axios
* Vite

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs

---

# Project Structure

```bash
multivendor/
│
├── backend/
├── frontend/
└── README.md
```

---

# Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server runs on:

```bash
http://localhost:5000
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Environment Variables

Create `.env` inside backend:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/multivendor
JWT_SECRET=your_secret_key
```

---

# Demo Credentials

## Admin

Email: [admin@gmail.com](mailto:admin@gmail.com)
Password: 123456

## Manager

Email: [manager@gmail.com](mailto:manager@gmail.com)
Password: 123456

## Staff

Email: [staff@gmail.com](mailto:staff@gmail.com)
Password: 123456

---

# Core Functionalities

* Multi-role login system
* Role-based dashboards
* Nested protected routes
* Dynamic permission-aware forms
* Records CRUD management
* Task assignment workflow
* Staff task completion flow
* Responsive SaaS dashboard UI

---

# Architecture Highlights

* Full-stack RBAC implementation
* Dynamic frontend + backend permission enforcement
* Nested dashboard routing
* Modular backend architecture
* Scalable React component structure

---

# Future Improvements

* Email notifications
* Real-time task updates with Socket.IO
* Dashboard analytics charts
* File uploads
* Audit logs
* Deployment support

---

# Author

Denish Patel
