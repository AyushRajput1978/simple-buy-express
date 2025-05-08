const express = require('express');

const productController = require('../controller/productController');
const authController = require('../controller/authController');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(productController.aliasTopProducts, productController.getAllProducts);

router.route('/products-stats').get(productController.getProductStats);

router
  .route('/')
  .get(authController.protect, productController.getAllProducts)
  .post(productController.createProduct);
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(
    authController.protect,
    authController.restrictTo('superAdmin', 'admin'),
    productController.deleteProduct
  );
module.exports = router;
