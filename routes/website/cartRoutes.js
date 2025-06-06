const express = require('express');
const cartController = require('../../controller/cartController');
const authController = require('../../controller/authController');

const router = express.Router();

router.use(authController.protect);

// Middleware to attach userId or sessionId to request
router.use((req, res, next) => {
  req.userId = req.user ? req.user.id : null;
  req.sessionId = req.headers['x-session-id'];
  if (!req.userId && !req.sessionId) {
    return res.status(400).json({ message: 'Missing sessionId or userId' });
  }
  next();
});

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.post('/update', cartController.updateCartItemQuantity);
// router.post('/remove', cartController.removeFromCart);
router.post('/clear', cartController.clearCart);

module.exports = router;
