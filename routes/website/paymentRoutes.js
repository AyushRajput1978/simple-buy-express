// routes/paymentRoutes.js
const express = require('express');

const router = express.Router();
const paymentController = require('../../controller/paymentController');
const authController = require('../../controller/authController');

// Secure Routes
router.post(
  '/create-payment-intent',
  authController.protect,
  paymentController.createPaymentIntent
);

// Stripe webhook
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

module.exports = router;
