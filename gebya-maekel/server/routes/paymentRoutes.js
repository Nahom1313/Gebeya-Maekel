const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initialize', protect, initializePayment);
router.get('/verify/:txRef', verifyPayment);

module.exports = router;