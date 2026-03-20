// ============================================================
//  Carbon Footprint Calculator - Backend Server
//  Tech Stack: Node.js + Express + MongoDB (Mongoose)
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carbonfootprint';
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey123';

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ─── SCHEMAS & MODELS ─────────────────────────────────────────

// 1. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// 2. Calculation Schema
const calculationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  weight: { type: Number, required: true },       // in kg
  distance: { type: Number, required: true },     // in km
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'economy'],
    default: 'standard',
  },
  co2Emission: { type: Number, required: true },  // in kg CO2
  offsetCost: { type: Number, required: true },   // in USD
  offsetPurchased: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Calculation = mongoose.model('Calculation', calculationSchema);

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

// ─── HELPER: Calculate CO2 ────────────────────────────────────
// Formula: CO2 (kg) = weight (kg) × distance (km) × emission factor
// Emission factors per shipping method (kg CO2 per kg per km)
const emissionFactors = {
  economy:  0.00015,   // slowest, least CO2
  standard: 0.00021,   // normal truck/ship
  express:  0.00035,   // fastest, most CO2 (air freight)
};

function calculateCO2(weight, distance, method) {
  const factor = emissionFactors[method] || emissionFactors.standard;
  return parseFloat((weight * distance * factor).toFixed(4));
}

// Offset cost: $0.02 per kg of CO2
function calculateOffsetCost(co2) {
  return parseFloat((co2 * 0.02).toFixed(2));
}

// ─── ROUTES ───────────────────────────────────────────────────

// Health Check
app.get('/', (req, res) => {
  res.json({ message: '🌿 Carbon Footprint Calculator API is running!' });
});

// ── AUTH ROUTES ──

// POST /api/auth/signup - Register a new user
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please log in.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login - Login existing user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/auth/me - Get current logged-in user info
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── CALCULATION ROUTES ──

// POST /api/calculate - Calculate CO2 for a shipment
app.post('/api/calculate', authMiddleware, async (req, res) => {
  try {
    const { productName, weight, distance, shippingMethod } = req.body;

    // Validate
    if (!productName || !weight || !distance || !shippingMethod) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }
    if (weight <= 0 || distance <= 0) {
      return res.status(400).json({ message: 'Weight and distance must be greater than 0.' });
    }

    // Calculate
    const co2Emission = calculateCO2(weight, distance, shippingMethod);
    const offsetCost = calculateOffsetCost(co2Emission);

    // Save to DB
    const calc = new Calculation({
      userId: req.userId,
      productName,
      weight,
      distance,
      shippingMethod,
      co2Emission,
      offsetCost,
    });
    await calc.save();

    res.status(201).json({
      message: 'Calculation saved!',
      calculation: calc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/calculations - Get all calculations for logged-in user
app.get('/api/calculations', authMiddleware, async (req, res) => {
  try {
    const calculations = await Calculation.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ calculations });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PATCH /api/calculations/:id/offset - Purchase offset for a calculation
app.patch('/api/calculations/:id/offset', authMiddleware, async (req, res) => {
  try {
    const calc = await Calculation.findOne({ _id: req.params.id, userId: req.userId });
    if (!calc) return res.status(404).json({ message: 'Calculation not found.' });
    if (calc.offsetPurchased) {
      return res.status(400).json({ message: 'Offset already purchased for this shipment.' });
    }

    calc.offsetPurchased = true;
    await calc.save();

    res.json({ message: '✅ Offset purchased successfully!', calculation: calc });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/calculations/:id - Delete a calculation
app.delete('/api/calculations/:id', authMiddleware, async (req, res) => {
  try {
    const calc = await Calculation.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!calc) return res.status(404).json({ message: 'Calculation not found.' });
    res.json({ message: 'Calculation deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/stats - Get summary stats for logged-in user
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const calculations = await Calculation.find({ userId: req.userId });

    const totalCalculations = calculations.length;
    const totalCO2 = calculations.reduce((sum, c) => sum + c.co2Emission, 0);
    const totalOffsets = calculations.filter((c) => c.offsetPurchased).length;
    const totalOffsetCost = calculations
      .filter((c) => c.offsetPurchased)
      .reduce((sum, c) => sum + c.offsetCost, 0);

    res.json({
      totalCalculations,
      totalCO2: parseFloat(totalCO2.toFixed(4)),
      totalOffsets,
      totalOffsetCost: parseFloat(totalOffsetCost.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── START SERVER ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
