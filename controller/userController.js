const User = require('../models/userModel');
const AppError = require('../utils/app-error');

const catchAsync = require('../utils/catchAsync');

const filteredObj = (obj, ...allowedFileds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFileds.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// Allow user to update the fields other than password
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.paswordConfirm) {
    next(
      new AppError('Updating password is not allowed, try update-password for password updation'),
      400
    );
  }
  const filteredBody = filteredObj(req.body, 'email', 'name');
  const newUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

// Allow user to delete (or inactive) the account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});

// Get All the users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ status: 'success', results: users.length, data: { users } });
});
