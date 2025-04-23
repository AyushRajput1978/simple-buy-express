const express = require('express');

const productController = require('../controller/productController');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(productController.aliasTopProducts, productController.getAllProducts);
router.route('/').get(productController.getAllProducts).post(productController.createProduct);
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);
module.exports = router;
