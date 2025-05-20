const express = require('express');
const cartController = require('../../controller/cartController');
const authController = require('../../controller/authController');

const router = express.Router();

router.use(authController.protect); // protect all cart routes

router.route('/').get(cartController.getCart).post(cartController.addToCart);

router
  .route('/:item_id')
  .patch(cartController.updateCartItem)
  .delete(cartController.removeCartItem);

module.exports = router;
