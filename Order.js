// models/Order.js — Gebya Maekel
const mongoose = require('mongoose');

// ── OrderItem sub-schema ───────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    variantId:  { type: mongoose.Schema.Types.ObjectId },  // null = base variant
    title:      { type: String, required: true },           // snapshot at time of order
    thumbnail:  { type: String },
    sku:        { type: String },
    quantity:   { type: Number, required: true, min: 1 },
    unitPrice:  { type: Number, required: true, min: 0 },  // ETB price paid per unit

    // ── Commission split per line item ──────────────────────────────────────
    lineTotal:           { type: Number, required: true },  // unitPrice × quantity
    platformTaxAmount:   { type: Number, required: true },  // platform cut (ETB)
    sellerPayoutAmount:  { type: Number, required: true },  // seller receives (ETB)
    commissionRate:      { type: Number, required: true },  // e.g. 0.08 = 8%
  },
  { _id: true }
);

// ── Shipping address sub-schema ────────────────────────────────────────────────
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName:  { type: String, required: true },
    phone:     { type: String, required: true },  // +251…
    city:      { type: String, required: true },
    subCity:   { type: String },
    woreda:    { type: String },
    kebele:    { type: String },
    notes:     { type: String, maxlength: 500 },
  },
  { _id: false }
);

// ── Order schema ───────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    items: {
      type:     [orderItemSchema],
      validate: [arr => arr.length > 0, 'Order must contain at least one item'],
    },

    // ── Financial summary (all in ETB) ──────────────────────────────────────
    subtotal:          { type: Number, required: true },  // sum of lineTotals
    shippingFee:       { type: Number, default: 0 },
    totalPrice:        { type: Number, required: true },  // subtotal + shippingFee
    platformTaxTotal:  { type: Number, required: true },  // sum of item platformTaxAmounts
    sellerPayoutTotal: { type: Number, required: true },  // sum of item sellerPayoutAmounts
    currency:          { type: String, default: 'ETB' },

    // ── Payment ─────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ['chapa', 'telebirr', 'cash_on_delivery'],
      required: true,
    },
    paymentStatus: {
      type:    String,
      enum:    ['pending', 'initiated', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index:   true,
    },
    paymentGatewayRef: { type: String },    // Chapa / Telebirr transaction ID
    paymentVerifiedAt: { type: Date },

    // Chapa checkout payload stored for webhook verification
    chapaCheckoutUrl:  { type: String },
    chapaTxRef:        { type: String, unique: true, sparse: true },

    // ── Delivery ────────────────────────────────────────────────────────────
    shippingAddress: { type: shippingAddressSchema, required: true },
    orderStatus: {
      type:    String,
      enum:    ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'placed',
      index:   true,
    },
    deliveredAt: { type: Date },

    // ── Seller payout tracking ───────────────────────────────────────────────
    // Each vendor in the order gets their own payout record
    payouts: [
      {
        vendor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        amount:        { type: Number, required: true },   // ETB to release
        status:        { type: String, enum: ['pending', 'processing', 'paid', 'failed'], default: 'pending' },
        processedAt:   { type: Date },
        gatewayRef:    { type: String },
      },
    ],

    notes: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

// ── Compound indexes ───────────────────────────────────────────────────────────
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ 'items.vendor': 1, orderStatus: 1 });
orderSchema.index({ chapaTxRef: 1 }, { sparse: true });

// ── Virtuals ───────────────────────────────────────────────────────────────────
orderSchema.virtual('isPaid').get(function () {
  return this.paymentStatus === 'paid';
});

module.exports = mongoose.model('Order', orderSchema);
