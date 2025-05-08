const express = require('express');
const authController = require('../controller/authController');
const userController = require('../controller/userController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.logIn);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').post(authController.resetPassword);
router.route('/update-password').patch(authController.protect, authController.updatePassword);
router.route('/update-me').patch(authController.protect, userController.updateMe);
router.route('/delete-me').delete(authController.protect, userController.deleteMe);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('superAdmin', 'admin'),
    userController.getAllUsers
  );
module.exports = router;
