const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET =
  "0a866ede118c0818c0eac8c952d8b1220bd3a8972c366fcdb134243513117f9004ea244bd41801044b19db93b0f5cb606ef4abcfefa0f1cd9df449f95edd7886";

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password, role: role || 'customer' });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log("Login Request Body:", req.body);

  try {
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    console.log("User found in DB:", user);

    if (!user) {
      console.log("No user found with this email");
      return res.status(400).json({ message: 'User not found' });
    }

    console.log("DB Password:", user.password, "| Incoming Password:", password);

    if (user.password !== password) {
      console.log("Passwords do NOT match");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("Passwords match ✅");

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
