const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products (with optional search and category filter)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Add a new product
router.post('/', async (req, res) => {
  try {
    const { name, price, quantity, category, unit } = req.body;

    // Simple validation
    if (!name || price === undefined || quantity === undefined || !category) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const numPrice = Number(price);
    const numQuantity = Number(quantity);

    if (isNaN(numPrice) || numPrice < 0 || isNaN(numQuantity) || numQuantity < 0) {
      return res.status(400).json({ message: 'Price and quantity must be positive numbers' });
    }

    const newProduct = new Product({
      name: name.trim(),
      price: numPrice,
      quantity: numQuantity,
      category: category.trim(),
      unit: unit || 'pcs'
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { name, price, quantity, category, unit } = req.body;

    if (!name || price === undefined || quantity === undefined || !category) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const numPrice = Number(price);
    const numQuantity = Number(quantity);

    if (isNaN(numPrice) || numPrice < 0 || isNaN(numQuantity) || numQuantity < 0) {
      return res.status(400).json({ message: 'Price and quantity must be positive numbers' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        price: numPrice,
        quantity: numQuantity,
        category: category.trim(),
        unit: unit || 'pcs'
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Quick adjust stock quantity (+1 or -1)
router.patch('/:id/stock', async (req, res) => {
  try {
    const { adjustment } = req.body;

    if (typeof adjustment !== 'number') {
      return res.status(400).json({ message: 'Adjustment must be a number' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newQuantity = product.quantity + adjustment;
    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Stock cannot be less than 0' });
    }

    product.quantity = newQuantity;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to adjust stock' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;