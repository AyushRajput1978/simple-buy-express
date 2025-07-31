const factory = require('./handlerFactory');
const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');

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
exports.getUserOrders = catchAsync(async (req, res) => {
  const { user } = req;

  let orders = await Order.find({ user: user._id })
    .select('-paymentIntentId -paymentMethod -__v -user')
    .populate({
      path: 'orderItems.product',
      select:
        '-priceDiscount -price -description -ratingsAverage -ratingsQuantity -__v -countInStock',
    })
    .lean(); 

  // Inject variant data manually
  orders = orders.map((order) => {
    order.orderItems = order.orderItems.map((item) => {
      const {product} = item;
      const variant = product?.variants?.find(
        (v) => 
         v._id.toString() === item.variantId
      );
      item.variant = variant ? { name: variant.attributeName, value: variant.attributeValue } : null;
      if(product&&product.variants){
        delete product.variants
      }
      return item;
    });
    return order;
  });

  res.status(200).json({
    status: 'success',
    data: orders || [],
  });
});

exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
