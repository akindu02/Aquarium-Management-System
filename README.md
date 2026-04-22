<div align="center">

# Methu Aquarium
### Advanced Aquarium Management & E-Commerce System

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](#)

> 🌊 **A comprehensive full-stack web application** designed to manage an aquarium retail and service business. From an e-commerce storefront to point-of-sale and supplier integrations, it offers an end-to-end solution for modern aquatic management.

</div>

<br/>

## ✨ Key Features

- 🛒 **E-commerce Storefront:** Browse and purchase fish, tanks, filters, food, chemicals, and live plants.
- 📅 **Service Booking System:** Schedule professional aquatic services like maintenance, cleaning, and installations.
- 💻 **Point-of-Sale (POS):** Dedicated, streamlined interface for staff to process walk-in customer transactions.
- 📦 **Inventory & Expiry Management:** Track stock levels, get alerts for expiring products, and automate restocks.
- 🤝 **Supplier Integration:** Seamless B2B workflows allowing staff to send direct restock requests to suppliers.
- 📊 **In-Depth Analytics:** Powerful intelligence dashboards driving data-backed business decisions.

---

## 📈 Advanced Reports & Analytics

The system features a robust, dedicated analytics engine that empowers administrators to monitor business health through real-time data and comprehensive reporting:

<details open>
<summary><b>💰 Sales & Revenue Reports</b></summary>
Tracks overall revenue across both online e-commerce transactions and in-store POS walk-ins, providing clear views of daily, weekly, and monthly financial growth.
</details>

<details open>
<summary><b>📦 Inventory & Expiry Analytics</b></summary>
Monitors stock levels across all categories. Automatically flags low-stock items and highlights products nearing expiration to minimize waste and automate supplier restocks.
</details>

<details open>
<summary><b>🏆 Product Performance Metrics</b></summary>
Identifies top-selling products and slow-moving inventory, helping business owners optimize their catalog, adjust pricing, and plan promotions effectively.
</details>

<details open>
<summary><b>👥 Customer Insights</b></summary>
Analyzes user registration trends, order frequencies, and behavioral data to better understand the customer base and tailor marketing or loyalty efforts.
</details>

<details open>
<summary><b>📅 Service Bookings Reports</b></summary>
Provides a detailed breakdown of service appointments (e.g., maintenance vs. installation), tracking staff workload and the most popular aquatic services over time.
</details>

---

## 👥 Interactive User Roles 
*(Click to expand each role to see their capabilities)*

<details>
<summary>👑 <b>Admin</b></summary>
<br>
Has full system oversight. Accesses the comprehensive analytics suites (Sales, Inventory, Customers, etc.), manages all underlying users, and wields full CRUD capabilities across all business entities.
</details>

<details>
<summary>👨‍💼 <b>Staff</b></summary>
<br>
Handles internal day-to-day operations. Accesses the POS, processes online orders and bookings, tracks product expiry, and generates supplier restock requests.
</details>

<details>
<summary>🏭 <b>Supplier</b></summary>
<br>
External partners who receive inventory restock requests directly from the store, manage their business profiles, and natively track their generated earnings.
</details>

<details>
<summary>🛍️ <b>Customer</b></summary>
<br>
End-users who can browse the retail store, place orders, book aquatic services, and view their personal order and booking histories.
</details>

---

## 🛠️ Tech Stack & Architecture

Structure is built around a robust monorepo utilizing a modern JavaScript/TypeScript ecosystem.

<details>
<summary><b>💻 Frontend Architecture</b></summary>

| Technology | Purpose |
| :--- | :--- |
| **React (v19)** | Core UI framework |
| **Vite** | Fast build tool and development server |
| **React Router DOM** | Client-side routing and navigation |
| **SweetAlert2** | Interactive, responsive dialogs and alerts |
| **html2pdf.js** | Client-side PDF receipt generation |

</details>

<details>
<summary><b>⚙️ Backend Architecture</b></summary>

| Technology | Purpose |
| :--- | :--- |
| **Node.js & Express** | High-performance REST API |
| **PostgreSQL & `pg`** | Highly relational database engine |
| **Multer** | Handling product and profile image uploads |
| **Nodemailer** | Email integrations (e.g., OTP password resets) |
| **express-validator** | Structured API input validation |

</details>

---

## 🔒 Security & Authentication

- 🔑 **JWT Authentication:** Secure JSON Web Token based authentication utilizing short-lived access tokens and persistent refresh tokens.
- 🛡️ **Role-Based Access Control (RBAC):** Strict middleware protecting and routing sensitive API endpoints based on the logged-in user's role.
- 🔐 **Password Hashing:** `bcryptjs` encryption ensures secure password storage.
- ✉️ **OTP Verification:** Secure 6-digit One Time Password (OTP) email flow for forgotten password resets.

<br/>

<div align="center">
  <sub>Built with ❤️ for aquatic enthusiasts and business owners.</sub>
</div>
