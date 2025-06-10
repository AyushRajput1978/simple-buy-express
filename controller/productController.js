const ProductCategory = require('../models/productCategoriesModel');
const Product = require('../models/productModel');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const { uploadBufferToS3, deleteFileFromS3 } = require('../middleware/upload');

// Middleware for setting limit, sort and fields
exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,image';
  next();
};
const imageFolder = 'product-images';
// Get all Products
exports.getAllProducts = factory.getAll(Product);

// Create a new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const { productCategoryId, ...productData } = req.body;
  let imageUrl = null; // Initialize imageUrl to null

  try {
    // --- Start Initial Validation Checks (before S3 upload) ---
    // 1. Validate if productCategoryId is provided and corresponds to an existing category
    const category = await ProductCategory.findById(productCategoryId);
    if (!category) {
      return next(new AppError('Invalid product category ID', 400));
    }
    // Add more synchronous/early asynchronous validation checks here if needed
    // (e.g., check if required fields are present in req.body before proceeding)
    // --- End Initial Validation Checks ---

    // If a file was uploaded and initial validations passed, upload to S3
    if (req.file) {
      imageUrl = await uploadBufferToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        imageFolder
      );
    }

    // Now attempt to create the product in the database.
    // Mongoose schema validations (like minLength, required) will run here.
    const product = await Product.create({
      ...productData,
      category: { _id: category._id, name: category.name },
      image: imageUrl, // Save the S3 image URL
    });

    // If product creation is successful, send a success response
    res.status(201).json({
      status: 'success',
      data: { data: product },
    });
  } catch (error) {
    // If an error occurs during product creation (e.g., Mongoose validation error),
    // and an image was uploaded, delete it from S3 to clean up.
    if (imageUrl) {
      await deleteFileFromS3(imageUrl);
    }
    // Re-throw the error so it can be caught by the global error handler (via catchAsync)
    return next(error);
  }
});

// Get a product
exports.getProduct = factory.getOne(Product, { path: 'reviews' });

// Update a product
exports.updateProduct = factory.updateOne(Product, undefined, imageFolder);

// Delete a product
exports.deleteProduct = factory.deleteOne(Product);

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
