const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

// Root route (so Render URL works)
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const Product = require('./models/product');
const Quote = require('./models/quote');

// Use route files
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// Public routes
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

app.get('/product/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.send(product);
});

app.get("/search", async (req, res) => {
  const query = req.query.q;
  try {
    const results = await Product.find({
      name: { $regex: query, $options: "i" }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const verifyToken = require('./middleware/auth');
app.post('/add-product', verifyToken, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.send(product);
});

app.post("/quote", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const quote = new Quote({ name, email, message });
    await quote.save();
    res.status(200).send({ success: true, message: "Quote submitted" });
  } catch (error) {
    console.error("Error saving quote:", error);
    res.status(500).send({ success: false, message: "Error saving quote" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
