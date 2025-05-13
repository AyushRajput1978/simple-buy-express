const express = require('express');

const productController = require('../controller/productController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:product_id/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(productController.aliasTopProducts, productController.getAllProducts);

router.route('/products-stats').get(productController.getProductStats);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.authorizeRoles('superAdmin', 'admin'),
    productController.createProduct
  );
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.authorizeRoles('superAdmin', 'admin'),
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.authorizeRoles('superAdmin', 'admin'),
    productController.deleteProduct
  );
module.exports = router;
