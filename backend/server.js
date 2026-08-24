require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
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
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection middleware error:', err);
  }
  next();
});

// Routes
app.use('/api/products', productRoutes);

// Health check route with MongoDB Atlas status details
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'OK',
    message: 'Product Inventory Server is running',
    database: states[dbState] || 'unknown',
    hasMongoUri: Boolean(process.env.MONGODB_URI || process.env.MONGO_URI)
  });
});

// API Root route
app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Product Inventory Manager API is operational'
  });
});

// Start Server when run directly in local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;