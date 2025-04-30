const Product = require('../models/productModels');
const APIFeatures = require('../utils/api-features');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catchAsync');

// Middleware for setting limit, sort and fields
exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,image';
  next();
};

// Get all Products
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // EXECUTE QUERY
  const products = await features.query;
  res.status(200).json({ status: 'success', result: products.length, products });
});

// Create a new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    product: newProduct,
  });
});

// Get a product
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError('No Product found with this product id', 404));
  }
  res.status(200).json({ sttaus: 'success', data: { product } });
});

// Update a product
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return next(new AppError('No Product found with this product id', 404));
  }
  res.status(200).json({ status: 'success', data: { product } });
});

// Delete a product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError('No Product found with this product id', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});

// aggregation pipeline
exports.getProductStats = catchAsync(async (req, res) => {
  const product = await Product.aggregate([
    { $match: { price: { $gte: 1 } } },
    {
      $group: {
        _id: '$category',
        numProducts: { $sum: 1 },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({ status: 'success', data: { product } });
});
