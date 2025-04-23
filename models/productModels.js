const mongoose = require('mongoose');
// const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    unique: true,
    trim: true,
    maxlength: [80, 'A product name must have less than or equal to 80 chars'],
    minlength: [5, 'A product name must have more than 5 chars'],
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price',
    },
  },
  description: { type: String, trim: true },
  category: {
    type: String,
    required: true,
    enum: {
      values: ["men's clothing", 'jewelery', 'electronics', "women's clothing"],
    },
  },
  image: String,
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
  },
  ratingsQuantity: { type: Number, default: 0 },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
