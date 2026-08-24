# Product-Inventory-Manager

A full-stack **MERN (MongoDB, Express.js, React, Node.js)** Product Inventory & Stock Management System with real-time KPI metrics, stock tracking, category filtering, search, and INR (₹) currency support.

---

## 🚀 Features

- 📦 **CRUD Operations**: Add, view, edit, and delete products with validation.
- ⚡ **Stock Level Monitoring**: Real-time tracking of in-stock, low-stock (<10 units), and out-of-stock items.
- 🔄 **Quick Stock Adjustments**: Fast `+` and `-` quantity updates directly from the table.
- 🔍 **Live Search & Filter**: Filter by category, stock status, or search product names/SKUs.
- 📊 **Dynamic Dashboard KPIs**: Total products, units count, total inventory valuation in INR (₹), low-stock alert counters.
- 🎨 **Responsive UI**: Built with Bootstrap 5, Bootstrap Icons, Outfit/Inter typography, and custom dark/light accents.
- 🏷️ **Custom Product Box Favicon**: SVG kraft product box branding.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Bootstrap 5, Bootstrap Icons, Vanilla CSS
- **Backend**: Node.js, Express.js, CORS, Dotenv
- **Database**: MongoDB with Mongoose ODM
- **Concurrency**: Concurrently (to run frontend and backend simultaneously)

---

## 📂 Project Structure

```
Product Inventory Manager/
├── backend/
│   ├── db/
│   │   └── db.js
│   ├── models/
│   │   └── Product.js
│   ├── routes/
│   │   └── productRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductForm.jsx
│   │   │   └── ProductList.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── index.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pratik-Dev29/Product-Inventory-Manager.git
   cd Product-Inventory-Manager
   ```

2. **Install all dependencies (root, backend, and frontend):**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   - In `backend/.env`:
     ```env
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/product_inventory
     ```

4. **Run the Application:**
   ```bash
   npm run dev
   ```
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get all products (supports search, sort, filter) |
| `GET` | `/api/products/:id` | Get single product by ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/:id` | Update an existing product |
| `PATCH` | `/api/products/:id/stock` | Quick adjust stock quantity |
| `DELETE` | `/api/products/:id` | Delete a product |
| `GET` | `/api/health` | Health check endpoint |

---

## 📄 License

This project is licensed under the MIT License.
