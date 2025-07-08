const express = require('express');
const cartController = require('../../controller/cartController');
const { cartUserCheck } = require('../../middleware/cartUserCheck');

const router = express.Router();

router.get('/', cartUserCheck, cartController.getCart);
router.post('/add', cartUserCheck, cartController.addToCart);
router.post('/update', cartUserCheck, cartController.updateCartItemQuantity);
// router.post('/remove', cartController.removeFromCart);
router.post('/clear', cartUserCheck, cartController.clearCart);

module.exports = router;
