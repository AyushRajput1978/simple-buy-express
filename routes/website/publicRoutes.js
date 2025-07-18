const express = require('express');

const productController = require('../../controller/productController');
const productCategoryController = require('../../controller/productCategoryController');

const router = express.Router();

router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProduct);
router.get('/products/:id/similar', productController.getSimilarProducts);

router.get('/product-categories', productCategoryController.getAllProductCategories);

module.exports = router;
