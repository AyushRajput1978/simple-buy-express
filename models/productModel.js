const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
// const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      unique: true,
      trim: true,
      maxlength: [80, 'A product name must have less than or equal to 80 chars'],
      minlength: [5, 'A product name must have more than 5 chars'],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    description: { type: String, trim: true },
    brand: { type: String },
    countInStock: { type: Number, required: [true, 'Count of stock is mandatory'] },
    // Embedded category info
    category: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: true,
      },
      name: { type: String, required: true },
    },
    image: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    secret: { type: Boolean, default: false, select: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
productSchema.virtual('priceRupees').get(function () {
  return this.price * 85.33;
});

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// Index to improve the performance of query search
productSchema.index({ price: 1, ratingsAverage: -1 });

// DOCUMENT MIDDLEWARE: Runs before save() or create()
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// productSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: Runs before find() or update()
productSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });
  next();
});

//AGGREGATION MIDDLEWARE
productSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
