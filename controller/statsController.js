const Product = require('../models/productModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllstats = catchAsync(async (req, res, next) => {
  const totalProducts = await Product.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'user' });
  //   const totalOrders = await Order.countDocuments();
  //   const totalCategories = await Category.countDocuments();

  //   // Sum up total revenue from all orders
  //   const orders = await Order.find({}, 'totalPrice');
  //   const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  res.status(200).json({ status: 'success', data: { totalProducts, totalCustomers } });
});
