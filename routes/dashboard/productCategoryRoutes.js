const express = require('express');
const productCategoryController = require('../../controller/productCategoryController');

const router = express.Router();

router
  .route('/')
  .get(productCategoryController.getAllProductCategories)
  .post(productCategoryController.createProductCategory);
router
  .route('/:id')
  .get(productCategoryController.getProductCategory)
  .patch(productCategoryController.updateProductCategory)
  .delete(productCategoryController.deleteProductCategory);
module.exports = router;
