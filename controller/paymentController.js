// controllers/paymentController.js
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

exports.createPaymentIntent = async (req, res, next) => {
  const { user } = req;
  const { subtotal, shipping } = req.body;
  const cart = await Cart.findOne({ userId: user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const amount = cart.items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);
  const totalAmount = amount + shipping;
  if (amount !== Number(subtotal)) {
    return res.status(400).json({ message: 'Amount is not matching' });
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100),
    currency: 'inr',
    metadata: {
      userId: user.id,
      customer_name: user.name,
      addressLine1: '123 Street',
      city: 'Mumbai',
      postalCode: '400001',
      country: 'IN',
    },
    description: 'Order payment from Simple Buy - E-commerce store',
  });
  if (paymentIntent.client_secret) {
    // Format order items from cart
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Create order
    try {
      await Order.create({
        user: user.id,
        orderItems,
        shippingAddress: {
          address: '123 Street',
          city: 'Mumbai',
          postalCode: '400001',
          country: 'IN',
        },
        paymentMethod: 'card',
        totalAmount: totalAmount,
        paymentIntentId: paymentIntent.id,
        status: 'confirmed',
      });
    } catch (err) {
      next(err);
    }
    // Clear cart
    await Cart.deleteOne({ userId: user.id });
    // cart.items = [];
    // await cart.save();
  }
  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
  });
};

exports.handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const { userId, addressLine1, city, postalCode, country } = intent.metadata;

    const cart = await Cart.findOne({ userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    // Format order items from cart
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Create order
    try {
      await Order.create({
        user: userId,
        orderItems,
        shippingAddress: {
          address: addressLine1,
          city,
          postalCode: postalCode,
          country,
        },
        paymentMethod: intent.payment_method_types?.[0] || 'card',
        totalAmount: intent.amount / 100,
        paymentIntentId: intent.id,
        status: 'confirmed',
      });
    } catch (err) {
      next(err);
    }
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({ received: true });
};
