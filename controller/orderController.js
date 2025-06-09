const factory = require('./handlerFactory');
const Order = require('../models/orderModel');

exports.getAllOrders = factory.getAll(Order, [
  {
    path: 'user',
    select: '_id name',
  },
  {
    path: 'orderItems.product',
    select: '_id name',
  },
]);

exports.getOrder = factory.getOne(Order, [
  {
    path: 'user',
    select: '_id name',
  },
  {
    path: 'orderItems.product',
    select: '_id name',
  },
]);

exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
