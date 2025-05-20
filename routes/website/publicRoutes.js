const express = require('express');

const productController = require('../../controller/productController');

const router = express.Router();

router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProduct);
router.get('/proudcts/:id/similar', productController.getSimilarProducts);

module.exports = router;
