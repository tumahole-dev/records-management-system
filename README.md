# Records Management System (RMS)

A complete web-based Records Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) for efficient management of employee, client, and project records.

## 🚀 Features

- **Employee Management** - Complete employee records with personal and job details
- **Client Management** - Client information and contract tracking
- **Project Management** - Project timelines, budgets, and team assignments
- **Document Management** - File uploads with version control and access management
- **Reporting System** - Generate Excel and PDF reports
- **Role-based Access Control** - Admin, HR, Client Manager, and Employee roles
- **Authentication & Authorization** - Secure JWT-based authentication
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for state management
- **Axios** for API calls
- **React Hook Form** for forms

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **Express Validator** for input validation

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev