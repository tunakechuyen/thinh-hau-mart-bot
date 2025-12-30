const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Middleware to check admin password (sent in headers for simplicity or query generic)
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['x-admin-password'];
    if (authHeader === process.env.ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Public route to check if server is up
router.get('/ping', (req, res) => res.json({ message: 'pong' }));

// Auth check
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// Protected Routes
router.use(authMiddleware);

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add product
router.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update product
router.put('/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted Product' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
