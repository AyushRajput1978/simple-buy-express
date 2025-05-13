const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/app-error');
const factory = require('./handlerFactory');

exports.setTourIds = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.product_id;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

// exports.createReview = catchAsync(async (req, res) => {
//   if (!req.body.product_id) req.body.product_id = req.params.product_id;
//   const newReview = await Review.create({
//     user: req.user._id,
//     product: req.body.product_id,
//     rating: req.body.rating,
//     comment: req.body.comment,
//   });
//   res.status(201).json({ status: 'success', data: { review: newReview } });
// });

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
