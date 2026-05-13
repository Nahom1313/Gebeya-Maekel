const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  assignDelivery,
  getDeliveryOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Guest friendly middleware
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/stats', protect, adminOnly, getOrderStats);
router.get('/delivery', protect, getDeliveryOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/assign', protect, adminOnly, assignDelivery);

module.exports = router;