const mongoose = require('mongoose');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: [true, 'A rating cannot be empty'], max: 5, min: 1 },
    comment: String,
    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.every((url) => typeof url === 'string');
        },
        message: 'All images must be URLs in string format',
      },
      default: [],
    },
    createdAt: { type: Date, default: Date.now() },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// To avoid the duplicate review from the user
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // this.populate({
  //   path: 'user',
  //   select: 'name photo',
  // }).populate({ path: 'product', select: 'name price category -_id' });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    { $group: { _id: '$product', nRatings: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
reviewSchema.post('save', function () {
  // This points to the current review
  this.constructor.calcAverageRatings(this.product);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.product);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
