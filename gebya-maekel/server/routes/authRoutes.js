const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Order = require('../models/Order');

router.post('/register', register);
router.post('/login', login);

// Make admin
router.put('/make-admin', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isAdmin: true },
      { returnDocument: 'after' }
    );
    res.json({ message: 'You are now an admin!', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update email
router.put('/update-email', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email: req.body.email },
      { returnDocument: 'after' }
    );
    res.json({ message: 'Email updated!', email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ user, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;