const { deleteFileFromS3, uploadBufferToS3 } = require('../middleware/upload');
const User = require('../models/userModel');
const AppError = require('../utils/app-error');

const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filteredObj = (obj, ...allowedFileds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFileds.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

// Allow user to update the fields other than password
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.paswordConfirm) {
    next(
      new AppError('Updating password is not allowed, try update-password for password updation'),
      400
    );
  }
  if (typeof req.body.addresses === 'string') {
    try {
      req.body.addresses = JSON.parse(req.body.addresses);
    } catch (err) {
      return next(new AppError('Invalid addresses format', 400));
    }
  }
  // Find the existing document
  const existingDoc = await User.findById(req.user.id);
  if (!existingDoc) {
    return next(new AppError('No user found!!', 404));
  }

  const updateData = { ...req.body };

  if (req.file) {
    // ✅ If there's a new file, delete the old S3 image if present
    if (existingDoc.photo) {
      await deleteFileFromS3(existingDoc.photo);
    }

    // ✅ Upload the new file to S3
    const imageUrl = await uploadBufferToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'profile-image'
    );
    updateData.photo = imageUrl;
  }
  const filteredBody = filteredObj(updateData, 'email', 'name', 'addresses', 'phoneNo', 'photo');
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
exports.getAllUsers = factory.getAll(User);

// Get one user
exports.getUser = factory.getOne(User);

// Delete user by admin
exports.deleteUser = factory.deleteOne(User);
