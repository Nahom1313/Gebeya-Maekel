// controllers/orderController.js — Gebya Maekel
// Task 3: Finalize Sale — commission split + Chapa payment initiation
'use strict';

const crypto        = require('crypto');
const axios         = require('axios');
const Order         = require('../models/Order');
const Product       = require('../models/Product');
const User          = require('../models/User');
const AppError      = require('../utils/AppError');   // custom error class (see below)
const catchAsync    = require('../utils/catchAsync'); // wraps async controllers

// ── Constants ─────────────────────────────────────────────────────────────────
const PLATFORM_COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '0.08'); // 8%
const CHAPA_BASE_URL           = 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY         = process.env.CHAPA_SECRET_KEY;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: calculate commission split for a single line item
// ─────────────────────────────────────────────────────────────────────────────
function calcCommissionSplit(unitPrice, quantity, rate = PLATFORM_COMMISSION_RATE) {
  const lineTotal          = parseFloat((unitPrice * quantity).toFixed(2));
  const platformTaxAmount  = parseFloat((lineTotal * rate).toFixed(2));
  const sellerPayoutAmount = parseFloat((lineTotal - platformTaxAmount).toFixed(2));
  return { lineTotal, platformTaxAmount, sellerPayoutAmount, commissionRate: rate };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build Chapa payment initiation payload
// Docs: https://developer.chapa.co/docs/accept-payments/
// ─────────────────────────────────────────────────────────────────────────────
function buildChapaPayload(order, buyer) {
  const txRef = `GBY-${order._id}-${Date.now()}`;

  return {
    txRef,
    payload: {
      amount:        order.totalPrice.toFixed(2),
      currency:      'ETB',
      email:         buyer.email,
      first_name:    buyer.firstName,
      last_name:     buyer.lastName,
      phone_number:  buyer.phone ?? '',
      tx_ref:        txRef,
      callback_url:  `${process.env.APP_URL}/api/payments/chapa/webhook`,
      return_url:    `${process.env.CLIENT_URL}/orders/${order._id}/confirmation`,
      customization: {
        title:       'Gebya Maekel Payment',
        description: `Order #${order._id}`,
        logo:        `${process.env.CLIENT_URL}/logo.png`,
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/finalize
// Body: { items: [{ productId, variantId?, quantity }], shippingAddress, paymentMethod }
// Auth: buyer JWT required
// ─────────────────────────────────────────────────────────────────────────────
exports.finalizeOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  const buyerId = req.user._id;

  // ── 1. Validate request body ──────────────────────────────────────────────
  if (!items?.length) {
    return next(new AppError('Order must contain at least one item.', 400));
  }

  if (!['chapa', 'telebirr', 'cash_on_delivery'].includes(paymentMethod)) {
    return next(new AppError('Unsupported payment method.', 400));
  }

  // ── 2. Fetch products and resolve prices ──────────────────────────────────
  const productIds   = items.map(i => i.productId);
  const products     = await Product.find({ _id: { $in: productIds }, status: 'active' }).lean();
  const productMap   = Object.fromEntries(products.map(p => [p._id.toString(), p]));

  const orderItems   = [];
  let subtotal       = 0;
  let platformTaxTotal  = 0;
  let sellerPayoutTotal = 0;

  // Group payouts by vendor for the payouts[] array
  const vendorPayouts = {};  // { vendorId: totalPayout }

  for (const item of items) {
    const product = productMap[item.productId];

    if (!product) {
      return next(new AppError(`Product ${item.productId} is not available.`, 404));
    }

    // Resolve variant or base price
    let unitPrice = product.discountPrice ?? product.basePrice;
    let variantId = undefined;

    if (item.variantId) {
      const variant = product.variants?.find(v => v._id.toString() === item.variantId);
      if (!variant) return next(new AppError('Variant not found.', 404));

      // Stock check
      if (variant.stock < item.quantity) {
        return next(
          new AppError(`Insufficient stock for "${product.title}" (${variant.label}).`, 400)
        );
      }
      unitPrice = variant.price;
      variantId = variant._id;
    } else {
      // Stock check (base product)
      if (product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for "${product.title}".`, 400));
      }
    }

    // ── Commission split ──────────────────────────────────────────────────
    const { lineTotal, platformTaxAmount, sellerPayoutAmount, commissionRate } =
      calcCommissionSplit(unitPrice, item.quantity);

    subtotal          += lineTotal;
    platformTaxTotal  += platformTaxAmount;
    sellerPayoutTotal += sellerPayoutAmount;

    // Accumulate vendor payout
    const vendorId = product.vendor.toString();
    vendorPayouts[vendorId] = (vendorPayouts[vendorId] ?? 0) + sellerPayoutAmount;

    orderItems.push({
      product:           product._id,
      vendor:            product.vendor,
      variantId,
      title:             product.title,
      thumbnail:         product.thumbnail ?? product.images?.[0],
      sku:               item.variantId
                          ? product.variants.find(v => v._id.toString() === item.variantId)?.sku
                          : product.sku,
      quantity:          item.quantity,
      unitPrice,
      lineTotal,
      platformTaxAmount,
      sellerPayoutAmount,
      commissionRate,
    });
  }

  // ── 3. Calculate totals ───────────────────────────────────────────────────
  const shippingFee  = 0;   // TODO: integrate shipping rate API
  const totalPrice   = parseFloat((subtotal + shippingFee).toFixed(2));

  const payoutsArray = Object.entries(vendorPayouts).map(([vendor, amount]) => ({
    vendor,
    amount: parseFloat(amount.toFixed(2)),
    status: 'pending',
  }));

  // ── 4. Fetch buyer for Chapa payload ──────────────────────────────────────
  const buyer = await User.findById(buyerId).lean();

  // ── 5. Create order in DB (status: pending until payment confirmed) ───────
  const order = await Order.create({
    buyer:            buyerId,
    items:            orderItems,
    subtotal:         parseFloat(subtotal.toFixed(2)),
    shippingFee,
    totalPrice,
    platformTaxTotal: parseFloat(platformTaxTotal.toFixed(2)),
    sellerPayoutTotal: parseFloat(sellerPayoutTotal.toFixed(2)),
    paymentMethod,
    paymentStatus:    'pending',
    shippingAddress,
    orderStatus:      'placed',
    payouts:          payoutsArray,
  });

  // ── 6. Reserve stock (atomic decrement) ──────────────────────────────────
  await Promise.all(
    orderItems.map(item =>
      item.variantId
        ? Product.updateOne(
            { _id: item.product, 'variants._id': item.variantId },
            { $inc: { 'variants.$.stock': -item.quantity } }
          )
        : Product.updateOne(
            { _id: item.product },
            { $inc: { stock: -item.quantity } }
          )
    )
  );

  // ── 7. Payment gateway integration ───────────────────────────────────────
  if (paymentMethod === 'chapa') {
    const { txRef, payload } = buildChapaPayload(order, buyer);

    let checkoutUrl;
    try {
      const chapaResp = await axios.post(
        `${CHAPA_BASE_URL}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10_000,
        }
      );

      checkoutUrl = chapaResp.data?.data?.checkout_url;

      if (!checkoutUrl) throw new Error('No checkout_url in Chapa response');
    } catch (err) {
      // Roll back stock and cancel order so buyer can retry
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: 'failed',
        orderStatus:   'cancelled',
      });
      await Promise.all(
        orderItems.map(item =>
          item.variantId
            ? Product.updateOne(
                { _id: item.product, 'variants._id': item.variantId },
                { $inc: { 'variants.$.stock': item.quantity } }
              )
            : Product.updateOne(
                { _id: item.product },
                { $inc: { stock: item.quantity } }
              )
        )
      );
      return next(
        new AppError(`Payment gateway error: ${err.message}. Please try again.`, 502)
      );
    }

    // Persist Chapa reference on order
    await Order.findByIdAndUpdate(order._id, {
      chapaTxRef:        txRef,
      chapaCheckoutUrl:  checkoutUrl,
      paymentStatus:     'initiated',
    });

    return res.status(201).json({
      status:  'success',
      message: 'Order created. Complete payment via Chapa.',
      data: {
        orderId:     order._id,
        totalPrice,
        currency:    'ETB',
        checkoutUrl,  // redirect buyer here
        txRef,
        commissionSummary: {
          subtotal:         parseFloat(subtotal.toFixed(2)),
          platformTaxTotal: parseFloat(platformTaxTotal.toFixed(2)),
          sellerPayoutTotal: parseFloat(sellerPayoutTotal.toFixed(2)),
          commissionRate:   `${(PLATFORM_COMMISSION_RATE * 100).toFixed(0)}%`,
        },
      },
    });
  }

  // ── 8. Telebirr or Cash-on-Delivery ──────────────────────────────────────
  // Telebirr integration requires their SDK / USSD push — return order for now
  return res.status(201).json({
    status:  'success',
    message: paymentMethod === 'cash_on_delivery'
      ? 'Order placed. Pay on delivery.'
      : 'Order placed. Complete Telebirr payment via the app.',
    data: {
      orderId:    order._id,
      totalPrice,
      currency:   'ETB',
      commissionSummary: {
        subtotal:          parseFloat(subtotal.toFixed(2)),
        platformTaxTotal:  parseFloat(platformTaxTotal.toFixed(2)),
        sellerPayoutTotal: parseFloat(sellerPayoutTotal.toFixed(2)),
        commissionRate:    `${(PLATFORM_COMMISSION_RATE * 100).toFixed(0)}%`,
      },
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/chapa/webhook
// Chapa calls this after payment completes. Verify HMAC and update order.
// ─────────────────────────────────────────────────────────────────────────────
exports.chapaWebhook = catchAsync(async (req, res, next) => {
  // 1. Verify HMAC-SHA256 signature sent by Chapa
  const signature = req.headers['chapa-signature'];
  const expected  = crypto
    .createHmac('sha256', process.env.CHAPA_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expected) {
    return next(new AppError('Invalid webhook signature.', 401));
  }

  const { tx_ref, status } = req.body;

  if (status !== 'success') {
    // Mark payment failed but do NOT auto-cancel; let the cron job handle it
    await Order.findOneAndUpdate(
      { chapaTxRef: tx_ref },
      { paymentStatus: 'failed' }
    );
    return res.status(200).json({ received: true });
  }

  // 2. Verify with Chapa API (double-check: never trust the webhook body alone)
  const verifyResp = await axios.get(
    `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
    { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } }
  );

  if (verifyResp.data?.data?.status !== 'success') {
    return next(new AppError('Payment verification failed.', 400));
  }

  // 3. Update order to paid
  const order = await Order.findOneAndUpdate(
    { chapaTxRef: tx_ref, paymentStatus: { $ne: 'paid' } }, // idempotent
    {
      paymentStatus:     'paid',
      orderStatus:       'confirmed',
      paymentGatewayRef: verifyResp.data.data.reference,
      paymentVerifiedAt: new Date(),
    },
    { new: true }
  );

  if (!order) {
    // Already processed — idempotent response
    return res.status(200).json({ received: true });
  }

  // 4. Queue seller payouts (in a real app: dispatch to a job queue like Bull)
  //    Here we just mark them as processing; a cron job does the actual transfer.
  await Order.findByIdAndUpdate(order._id, {
    $set: { 'payouts.$[].status': 'processing' },
  });

  // 5. TODO: send buyer and seller confirmation emails/SMS via local provider

  return res.status(200).json({ received: true });
});


// ─────────────────────────────────────────────────────────────────────────────
// Utility stubs expected by this controller
// ─────────────────────────────────────────────────────────────────────────────

// utils/AppError.js
// class AppError extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//     this.isOperational = true;
//   }
// }
// module.exports = AppError;

// utils/catchAsync.js
// module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
