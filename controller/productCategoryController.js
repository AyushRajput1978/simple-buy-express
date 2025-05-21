const ProductCategory = require('../models/productCategoriesModel');
const syncCategoryName = require('../utils/syncCategoryName');
const factory = require('./handlerFactory');

exports.getAllProductCategories = factory.getAll(ProductCategory);
exports.getProductCategory = factory.getOne(ProductCategory);
exports.createProductCategory = factory.createOne(ProductCategory);
exports.updateProductCategory = factory.updateOne(ProductCategory, syncCategoryName);
exports.deleteProductCategory = factory.deleteOne(ProductCategory);
