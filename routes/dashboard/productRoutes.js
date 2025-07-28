const express = require('express');

const productController = require('../../controller/productController');

const reviewRouter = require('../reviewRoutes');
const { upload } = require('../../middleware/upload');
const parseArrayField = require('../../middleware/parseArrayFIeld');

const router = express.Router();

router.use('/:product_id/reviews', reviewRouter);

// router
//   .route('/top-5-cheap')
//   .get(productController.aliasTopProducts, productController.getAllProducts);

// router.route('/products-stats').get(productController.getProductStats);
// router.use(authController.protect);
// router.use(authController.authorizeRoles('superAdmin', 'admin'));
router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    upload.single('image'),
    parseArrayField('variants', {
      cast: (item) => ({
        ...item,
        regularPrice: parseFloat(item.regularPrice),
        countInStock: Number(item.countInStock),
      }),
    }),
    productController.createProduct
  );
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    upload.single('image'),
    parseArrayField('variants', {
      cast: (item) => ({
        ...item,
        regularPrice: parseFloat(item.regularPrice),
        countInStock: Number(item.countInStock),
      }),
    }),
    productController.updateProduct
  )
  .delete(productController.deleteProduct);
router.route('/:id/similar').get(productController.getSimilarProducts);
module.exports = router;
