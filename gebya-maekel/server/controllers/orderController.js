const Order = require('../models/Order');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice } = req.body;
    const order = await Order.create({ user: req.user.id, items, totalPrice });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged in user orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};