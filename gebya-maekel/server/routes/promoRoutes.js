const express = require('express');
const router = express.Router();
const {
  validatePromo,
  applyPromo,
  createPromo,
  getPromos,
  deletePromo,
  togglePromo,
} = require('../controllers/promoController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/validate', protect, validatePromo);
router.post('/apply', protect, applyPromo);
router.post('/', protect, adminOnly, createPromo);
router.get('/', protect, adminOnly, getPromos);
router.delete('/:id', protect, adminOnly, deletePromo);
router.put('/:id/toggle', protect, adminOnly, togglePromo);

module.exports = router;