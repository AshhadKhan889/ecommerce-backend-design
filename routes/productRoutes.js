const express = require('express');
const Product = require('../models/product'); // Mongoose model
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/all', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const products = await Product.find().skip(skip).limit(limit);
    const total = await Product.countDocuments();

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add Product (Admin Only)
router.post('/add', verifyToken, async (req, res) => {
  try {
    // Only admins can add
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: "Forbidden: Employees only" });
    }

    const { name, price, category, image, description, stock } = req.body;

    // Basic validation
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const newProduct = new Product({
      name,
      price,
      category,
      image,
      description,
      stock
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding product" });
  }
});

module.exports = router;
