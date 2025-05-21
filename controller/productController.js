const ProductCategory = require('../models/productCategoriesModel');
const Product = require('../models/productModel');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Middleware for setting limit, sort and fields
exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,image';
  next();
};
// Get all Products
exports.getAllProducts = factory.getAll(Product);

// Create a new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const { productCategoryId, ...productData } = req.body;
  const category = await ProductCategory.findById(productCategoryId);
  const product = await Product.create({
    ...productData,
    category: { _id: category._id, name: category.name },
  });
  res.status(201).json({
    status: 'success',
    data: { data: product },
  });
});

// Get a product
exports.getProduct = factory.getOne(Product, { path: 'reviews' });

// Update a product
exports.updateProduct = factory.updateOne(Product);

// Delete a product
exports.deleteProduct = factory.deleteOne(Product);

// exports.getAllProducts = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(Product.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   // EXECUTE QUERY
//   const products = await features.query;
//   res.status(200).json({ status: 'success', result: products.length, products });
// });

// exports.getProduct = catchAsync(async (req, res, next) => {
//   const product = await Product.findById(req.params.id).populate('reviews');
//   if (!product) {
//     return next(new AppError('No Product found with this product id', 404));
//   }
//   res.status(200).json({ sttaus: 'success', data: { product } });
// });

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

// Get similar products
exports.getSimilarProducts = catchAsync(async (req, res, next) => {
  const currentProduct = await Product.findById(req.params.id);
  if (!currentProduct) {
    return next(new AppError('No product found with this id', 404));
  }
  const similarProducts = await Product.find({
    category: currentProduct.category,
    _id: { $ne: currentProduct._id },
  }).limit(6);
  res
    .status(200)
    .json({ status: 'success', result: similarProducts.length, data: { similarProducts } });
});
