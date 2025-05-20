const express = require('express');

const productController = require('../../controller/productController');

const reviewRouter = require('../reviewRoutes');

const router = express.Router();

router.use('/:product_id/reviews', reviewRouter);

// router
//   .route('/top-5-cheap')
//   .get(productController.aliasTopProducts, productController.getAllProducts);

// router.route('/products-stats').get(productController.getProductStats);
// router.use(authController.protect);
// router.use(authController.authorizeRoles('superAdmin', 'admin'));
router.route('/').get(productController.getAllProducts).post(productController.createProduct);
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);
router.route('/:id/similar').get(productController.getSimilarProducts);
module.exports = router;
