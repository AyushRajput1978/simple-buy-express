const express = require('express');

const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');
const { uploadMultipleImages } = require('../middleware/uploadMultipleImages');

const router = express.Router({ mergeParams: true });
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.authorizeRoles('user', 'superAdmin'),
    reviewController.setProductIds,
    uploadMultipleImages('review-images'),
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.authorizeRoles('user', 'superAdmin'),
    reviewController.setProductIds,
    uploadMultipleImages('review-images'),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.authorizeRoles('user', 'superAdmin'),
    reviewController.deleteReview
  );
module.exports = router;
