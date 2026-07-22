# 🧺 Laundry Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**A Complete Laundry Management System with Role-Based Access Control**

</div>

---

## 📖 About The Project

**Laundry Management System** is a full-stack web application designed to streamline laundry business operations. It provides a comprehensive solution for managing orders, customers, employees, inventory, expenses, and deliveries with real-time tracking.

### 🎯 Key Highlights

- ✅ **Role-Based Access Control** - Admin, Employee (Washer, Ironer, Packer, Delivery), Accountant, Manager
- ✅ **Real-Time Order Tracking** - Live status updates from pickup to delivery
- ✅ **Payment Collection** - Support for Cash, KPay, Wave Pay
- ✅ **Live Delivery Tracking** - Real-time GPS tracking with interactive maps
- ✅ **Comprehensive Reports** - Daily, Weekly, Monthly, Yearly reports with Excel export
- ✅ **Dark/Light Mode** - User-friendly theme switching
- ✅ **Mobile Responsive** - Fully optimized for all devices

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Admin, Employee, Delivery, Accountant, Manager)
- Protected routes and API endpoints
- Password hashing with bcrypt

### 📦 Order Management
- Full CRUD operations
- Order status workflow (pending → collected → washing → ironing → ready → delivered → completed)
- Payment collection (Cash, KPay, Wave Pay)
- Order history tracking
- Add/update order items

### 👥 Customer Management
- Full CRUD operations
- Customer search and filtering
- Customer order history
- Myanmar font support for addresses

### 👔 Employee Management
- Position-based roles (Washer, Ironer, Packer, Delivery, Manager)
- Salary management
- Position-specific dashboards

### 💰 Expense Management
- Expense categories
- Expense approval workflow
- Expense reports and analytics

### 📦 Inventory Management
- Stock management
- Low stock alerts
- Inventory transactions tracking
- Supplier management

### 📊 Reports & Analytics
- Daily/Weekly/Monthly/Yearly reports
- Custom date range reports
- Export to Excel/CSV
- Payment method breakdown
- Profit/Loss analysis

### 🗺️ Live Delivery Tracking
- Real-time GPS tracking
- Leaflet map integration
- Pickup/Delivery markers
- Auto-refresh (10 seconds)

### 🎨 UI/UX Features
- Dark/Light mode
- Mobile responsive
- Toast notifications
- Loading states
- Form validation
- Smooth animations

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI Framework |
| React Router | 6.22.0 | Routing |
| React Bootstrap | 2.10.10 | UI Components |
| React Icons | 4.12.0 | Icons |
| Axios | 1.18.1 | API Calls |
| React Hook Form | 7.45.2 | Form Handling |
| React Hot Toast | 2.6.0 | Notifications |
| Recharts | 2.15.4 | Charts |
| Leaflet | 1.9.4 | Maps |
| React Leaflet | 4.2.1 | Map Components |
| Date-fns | 2.30.0 | Date Formatting |
| XLSX | 0.18.5 | Excel Export |
| Vite | 4.4.5 | Build Tool |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.18.2 | Web Framework |
| Sequelize | 6.32.1 | ORM |
| PostgreSQL | 15+ | Database |
| JWT | 9.0.0 | Authentication |
| Bcryptjs | 2.4.3 | Password Hashing |
| CORS | 2.8.5 | Cross-Origin |
| Dotenv | 16.0.3 | Environment Variables |
| Moment | 2.29.4 | Date/Time |

### Deployment
| Service | Purpose |
|---|---|
| Railway | Backend + PostgreSQL Database |
| Render | Frontend Static Site |

---

## 📁 Project Structure
