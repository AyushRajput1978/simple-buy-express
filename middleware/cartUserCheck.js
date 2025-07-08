const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/app-error');
const User = require('../models/userModel');
// Middleware to attach userId or sessionId to request
exports.cartUserCheck = catchAsync(async (req, res, next) => {
  // 1) Check if token exists
  let token;
  let currentUser;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    // 2) Token verification
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    currentUser = await User.findById(decode.id);
    if (!currentUser) {
      return next(new AppError('You are not logged in, please login to get access', 401));
    }
  }
  const sessionId = req.headers['x-session-id'];

  req.sessionId = sessionId;
  req.userId = currentUser ? currentUser.id : null;
  if (!currentUser && !sessionId) {
    return res.status(400).json({ message: 'Missing sessionId or userId' });
  }
  // ✅ Allow guest user if sessionId exists
  if (!currentUser && sessionId) {
    return next();
  }

  // ✅ Allow logged-in user but not admin
  if (currentUser && currentUser.role !== 'admin') {
    return next();
  }

  // ❌ Block admin or missing sessionId/userId
  return res.status(403).json({ message: 'Admins are not allowed or sessionId is missing' });
});
