require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Ensure Database is connected for each request in serverless environment
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/products', productRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Product Inventory Server is running' });
});

// API Root route
app.get('/api', (req, res) => {
  res.json({ status: 'OK', message: 'Product Inventory Manager API' });
});

// Start Server when run directly in local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;