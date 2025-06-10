const Product = require('../models/productModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const ProductCategories = require('../models/productCategoriesModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllstats = catchAsync(async (req, res, next) => {
  const totalProducts = await Product.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'user' });
  const totalOrders = await Order.countDocuments();
  const totalProductCategories = await ProductCategories.countDocuments();

  //   // Sum up total revenue from all orders
  const orders = await Order.find({}, 'totalAmount');
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2);

  res.status(200).json({
    status: 'success',
    data: { totalProducts, totalCustomers, totalOrders, totalProductCategories, totalRevenue },
  });
});
