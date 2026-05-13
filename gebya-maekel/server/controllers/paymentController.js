const axios = require('axios');
const Order = require('../models/Order');

exports.initializePayment = async (req, res) => {
  try {
    const { orderId, guestInfo } = req.body;

    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const txRef = `order-${orderId}-${Date.now()}`;

    // Use guest info or user info
    const customerName = order.user?.name || guestInfo?.name || 'Guest';
    const customerEmail = order.user?.email || guestInfo?.email || 'guest@gebeyamaekel.com';

    const nameParts = customerName.split(' ');
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts[1] || 'Customer';

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        first_name: firstName,
        last_name: lastName,
        email: customerEmail,
        amount: String(order.totalPrice),
        currency: 'ETB',
        tx_ref: txRef,
        callback_url: `${process.env.SERVER_URL}/api/payment/verify/${txRef}`,
        return_url: `${process.env.CLIENT_URL}/order-success`,
        customization: {
          title: 'Gebeya Maekel',
          description: 'Payment for your order',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    order.txRef = txRef;
    await order.save();

    res.json({ checkoutUrl: response.data.data.checkout_url });
  } catch (error) {
    console.error('Chapa error:', error.response?.data || error.message);
    res.status(500).json({ message: error.response?.data?.message || error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { txRef } = req.params;

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === 'success') {
      const order = await Order.findOne({ txRef });
      if (order) {
        order.isPaid = true;
        await order.save();
      }
    }

    res.redirect(`http://localhost:5173/order-success`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};