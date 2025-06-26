const express = require('express');
const cartController = require('../../controller/cartController');

const router = express.Router();

// Middleware to attach userId or sessionId to request
router.use((req, res, next) => {
  const { user } = req;
  const sessionId = req.headers['x-session-id'];
  req.userId = user ? user.id : null;
  req.sessionId = sessionId;
  if (!user && !sessionId) {
    return res.status(400).json({ message: 'Missing sessionId or userId' });
  }
  // ✅ Allow guest user if sessionId exists
  if (!user && sessionId) {
    return next();
  }

  // ✅ Allow logged-in user but not admin
  if (user && user.role !== 'admin') {
    return next();
  }

  // ❌ Block admin or missing sessionId/userId
  return res.status(403).json({ message: 'Admins are not allowed or sessionId is missing' });
});

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.post('/update', cartController.updateCartItemQuantity);
// router.post('/remove', cartController.removeFromCart);
router.post('/clear', cartController.clearCart);

module.exports = router;
