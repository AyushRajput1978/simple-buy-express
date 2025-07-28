const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  variantId: { type: String, required: true },
  priceAtTime: { type: Number, required: true }, // Store variant price
  attributeName: { type: String },
  attributeValue: { type: String },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: null },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cart', cartSchema);
