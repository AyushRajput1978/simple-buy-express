const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

exports.getCart = catchAsync(async (req, res) => {
  const { userId, sessionId } = req;
  const query = userId ? { userId } : { sessionId };
  const cart = await Cart.findOne(query).populate('items.product');
  res.status(200).json({
    status: 'success',
    data: cart || [],
  });
});

exports.addToCart = catchAsync(async (req, res) => {
  try {
    const { userId, sessionId } = req;
    const { productId, variantId, quantity } = req.body;
    if (!productId || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    // Check if product exists and get current stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const variant = product.variants.find((varnt) => varnt.id === variantId);
    if (variant.countInStock <= 0) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }

    const query = userId ? { userId } : { sessionId };
    let cart = await Cart.findOne(query);
    if (!cart) {
      cart = new Cart({ userId, sessionId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variantId === variantId
    );
    let newQuantity = quantity;

    if (itemIndex > -1) {
      const currentQuantity = cart.items[itemIndex].quantity;
      newQuantity = currentQuantity + quantity;

      if (newQuantity > variant.countInStock) {
        return res.status(400).json({ message: `Cannot add more than ${product.inStock} items` });
      }

      cart.items[itemIndex].quantity = newQuantity;
    } else {
      if (quantity > variant.countInStock) {
        return res.status(400).json({ message: `Cannot add more than ${product.inStock} items` });
      }

      cart.items.push({
        product: productId,
        quantity,
        variantId,
        priceAtTime: variant.regularPrice,
        attributeName: variant.attributeName,
        attributeValue: variant.attributeValue,
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Item Added successfully', cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

exports.updateCartItemQuantity = catchAsync(async (req, res) => {
  const { userId, sessionId } = req;
  const { productId, variantId, action } = req.body; // action = "increment" or "decrement"

  if (!productId || !variantId || !['increment', 'decrement'].includes(action)) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const query = userId ? { userId } : { sessionId };
  const cart = await Cart.findOne(query);
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.variantId === variantId
  );
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not in cart' });
  }

  const item = cart.items[itemIndex];
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const variant = product.variants.find((varnt) => varnt.id === variantId);
  if (!variant) return res.status(404).json({ message: 'Variant not found' });

  let updated = false;

  if (action === 'increment') {
    if (item.quantity >= variant.countInStock) {
      return res.status(400).json({ message: `Only ${variant.countInStock} items in stock` });
    }
    item.quantity += 1;
    updated = true;
  }

  if (action === 'decrement') {
    item.quantity -= 1;
    updated = true;
    if (item.quantity <= 0) {
      cart.items.splice(itemIndex, 1); // remove the item
    }
  }

  if (updated) {
    cart.updatedAt = Date.now();
    await cart.save();
  }
  res.status(200).json({ message: 'Cart updated', cart });
});

// exports.removeFromCart = catchAsync(async (req, res) => {
//   const { userId, sessionId } = req;
//   const { productId } = req.body;

//   const query = userId ? { userId } : { sessionId };
//   const cart = await Cart.findOne(query);
//   if (!cart) return res.status(404).json({ message: 'Cart not found' });

//   cart.items = cart.items.filter((item) => item.product.toString() !== productId);
//   cart.updatedAt = Date.now();
//   await cart.save();
//   res.json(cart);
// });

exports.clearCart = catchAsync(async (req, res) => {
  const { userId, sessionId } = req;

  const query = userId ? { userId } : { sessionId };
  const cart = await Cart.findOne(query);
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = [];
  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
});
