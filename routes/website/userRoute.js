const express = require('express');
const authController = require('../../controller/authController');
const userController = require('../../controller/userController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.logIn);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').post(authController.resetPassword);

// Protect the routes with the middleware
router.use(authController.protect);

router.route('/update-password').patch(authController.updatePassword);
router.route('/update-me').patch(userController.updateMe);
router.route('/delete-me').delete(userController.deleteMe);
router.route('/me').get(userController.getMe, userController.getUser);

module.exports = router;
