const PromoCode = require('../models/PromoCode');

// Validate promo code
exports.validatePromo = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promo) return res.status(404).json({ message: 'Invalid promo code' });
    if (new Date() > promo.expiryDate) return res.status(400).json({ message: 'Promo code has expired' });
    if (promo.usedCount >= promo.maxUses) return res.status(400).json({ message: 'Promo code has reached its limit' });
    if (orderAmount < promo.minOrderAmount) return res.status(400).json({ message: `Minimum order amount is ETB ${promo.minOrderAmount}` });

    const discount = promo.discountType === 'percentage'
      ? Math.round(orderAmount * promo.discountValue / 100)
      : promo.discountValue;

    res.json({
      valid: true,
      discount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      message: `Promo code applied! You save ETB ${discount}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply promo code (increment used count)
exports.applyPromo = async (req, res) => {
  try {
    const { code } = req.body;
    await PromoCode.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
    res.json({ message: 'Promo code applied' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create promo code (admin)
exports.createPromo = async (req, res) => {
  try {
    const promo = await PromoCode.create(req.body);
    res.status(201).json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all promo codes (admin)
exports.getPromos = async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete promo code (admin)
exports.deletePromo = async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promo code deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle promo code active status (admin)
exports.togglePromo = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promo code not found' });
    promo.isActive = !promo.isActive;
    await promo.save();
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};