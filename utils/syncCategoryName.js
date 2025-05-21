// utils/syncCategoryName.js
const Product = require('../models/productModel');

const syncCategoryName = async (updatedCategory) => {
  await Product.updateMany(
    { 'category._id': updatedCategory._id },
    { $set: { 'category.name': updatedCategory.name } }
  );
};

module.exports = syncCategoryName;
