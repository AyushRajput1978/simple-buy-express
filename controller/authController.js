const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/app-error');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
exports.signUp = catchAsync(async (req, res) => {
  const newUSer = await User.create({
    name: req.body.name,
    email: req.body.email,
    phoneNo: req.body.phoneNo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken(newUSer._id);
  res.status(201).json({
    status: 'success',
    data: {
      token,
      user: newUSer,
    },
  });
});
exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check for email and password
  if (!email || !password) {
    return next(new AppError('Enter valid Email address and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  console.log('suer', user);
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  const token = signToken(user.id);
  res.status(200).json({
    status: 'success',
    data: {
      token,
    },
  });
});
