const express = require('express');
const authController = require('../../controller/authController');
const statsControler = require('../../controller/statsController');

const productRoutes = require('./productRoutes');
const productCategoryRoutes = require('./productCategoryRoutes');
const userRoutes = require('./userRoutes');
// const orderRoutes = require('./orderRoutes');
// const statsRoutes = require('./statsRoutes');

const router = express.Router();

// Apply global protection to all dashboard routes
router.use(authController.protect);

router
  .route('/stats')
  .get(authController.authorizeRoles('admin', 'superAdmin'), statsControler.getAllstats);

// Mount resource-specific routes
router.use('/products', authController.authorizeRoles('admin', 'superAdmin'), productRoutes);
router.use(
  '/product-categories',
  authController.authorizeRoles('admin', 'superAdmin'),
  productCategoryRoutes
);
router.use('/users', authController.authorizeRoles('superAdmin'), userRoutes);
// router.use('/orders', authController.authorizeRoles('admin', 'superAdmin'), orderRoutes);
// router.use('/stats', authController.authorizeRoles('admin', 'superAdmin'), statsRoutes);

module.exports = router;
