The Residence – Rent Management System

The Residence is a modern web-based Rent Management System designed to simplify property management for landlords and property managers. The system allows users to efficiently manage tenants, units, payments, and rental agreements, with real-time dashboards, notifications, and reporting features.

Table of Contents

Features

Technologies Used

Installation

Configuration

Usage

API Endpoints

Project Structure

Contributing

License

Features

User Authentication – Secure login and registration for landlords and property managers.

Tenant Management – Add, edit, and track tenants.

Unit Management – Manage property units and their occupancy status.

Payment Tracking – Record rent payments and monitor overdue payments.

Dashboard – Real-time insights into rental income, tenant status, and occupancy.

Notifications – Email and SMS notifications are planned (not yet integrated).

Reporting – Generate financial reports and export data for record-keeping.

Responsive UI – Mobile-friendly interface for easy access on any device.

Technologies Used

Frontend: React, TypeScript, Tailwind CSS, Sonner (toast notifications)

Backend: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication

Utilities: Nodemailer (email notifications), PDF generation for receipts

Deployment: Localhost development (backend: 5000, frontend: 5173), easily deployable to cloud servers

Installation

Clone the repository

git clone https://github.com/yourusername/the-residence.git
cd the-residence

Install backend dependencies

cd backend
npm install

Install frontend dependencies

cd ../frontend
npm install

Run the development server

# Backend
cd backend
npm run dev # Runs on http://localhost:5000

# Frontend
cd frontend
npm run dev # Runs on http://localhost:5173
Configuration

Environment Variables

Create a .env file in the backend directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password

Frontend API URL

Ensure the frontend fetch calls point to the backend API:

const API_URL = "http://localhost:5000/api";
Usage

Open the frontend in your browser: http://localhost:5173

Register a new landlord account or login with existing credentials.

Navigate the dashboard to manage tenants, units, and payments.

Record rent payments (email/SMS notifications for receipts will be available in future updates).

Monitor real-time stats and generate reports for financial tracking.

API Endpoints

Authentication

POST /api/auth/register – Register a new user

POST /api/auth/login – Login and receive JWT

Tenants

GET /api/tenants – Get all tenants

POST /api/tenants – Add a tenant

PUT /api/tenants/:id – Update tenant info

DELETE /api/tenants/:id – Delete tenant

Payments

GET /api/payments – Get all payments

POST /api/payments – Record a new payment

POST /api/payments/:id/send-receipt – Send payment receipt

Units

GET /api/units – Get all units

POST /api/units – Add a new unit

PUT /api/units/:id – Update unit info

DELETE /api/units/:id – Delete unit

Note: Most routes are protected and require a valid JWT token in Authorization header.

Project Structure
The-Residence/
├─ backend/
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  ├─ middleware/
│  ├─ utils/
│  └─ server.js
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ contexts/
│  │  ├─ pages/
│  │  └─ App.tsx
│  └─ package.json
└─ README.md
Contributing

Contributions are welcome! Please follow these steps:

Fork the repository

Create a new branch (git checkout -b feature/feature-name)

Make your changes

Commit your changes (git commit -m "Add new feature")

Push to the branch (git push origin feature/feature-name)

Create a pull request