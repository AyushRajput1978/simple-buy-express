const Product = require('../models/productModels');

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({ status: 'success', products });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      status: 'success',
      product: newProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
// exports.getProduct = (req, res, next) => {};
// exports.updateProduct = (req, res, next) => {};
// exports.deleteProduct = (req, res, next) => {};
