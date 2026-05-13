const Order = require('../models/Order');
const TAX_CONFIG = require('../config/taxConfig');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, guestInfo } = req.body;
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxAmount = Math.round(subtotal * TAX_CONFIG.VAT_RATE);
    const deliveryFee = subtotal >= TAX_CONFIG.FREE_DELIVERY_ABOVE ? 0 : TAX_CONFIG.DELIVERY_FEE;
    const totalPrice = subtotal + taxAmount + deliveryFee;

    const order = await Order.create({
      user: req.user?._id || null,
      guestInfo: req.user ? null : guestInfo,
      items,
      shippingAddress,
      subtotal,
      taxAmount,
      deliveryFee,
      totalPrice,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged in user orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('deliveryPerson', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isAdmin = req.user.isAdmin;
    const isAssignedDelivery = order.deliveryPerson?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedDelivery) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    order.status = status;
    order.isDelivered = status === 'delivered';
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign delivery person (admin)
exports.assignDelivery = async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryPerson: deliveryPersonId, status: 'confirmed' },
      { new: true }
    ).populate('deliveryPerson', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get delivery person orders
exports.getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPerson: req.user._id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order stats (admin)
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalTax = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$taxAmount' } } }
    ]);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalTax: totalTax[0]?.total || 0,
      pendingOrders,
      deliveredOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};