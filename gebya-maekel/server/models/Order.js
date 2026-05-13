const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  shippingAddress: {
    address: { type: String },
    city: { type: String },
    phone: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  paymentMethod: {
    type: String,
    enum: ['chapa', 'telebirr', 'cash'],
    default: 'chapa'
  },
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  isDelivered: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  txRef: { type: String },
  deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);