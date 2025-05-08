const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/app-error');
const sendMail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const createSendToken = (res, user) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  // Remove the password from the output
  user.password = undefined;
  res.status(201).json({
    status: 'success',
    data: {
      token,
      user,
    },
  });
};
// Sign up
exports.signUp = catchAsync(async (req, res) => {
  const newUSer = await User.create({
    name: req.body.name,
    email: req.body.email,
    phoneNo: req.body.phoneNo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createSendToken(res, newUSer);
  // const token = signToken(newUSer._id);
  // res.status(201).json({
  //   status: 'success',
  //   data: {
  //     token,
  //     user: newUSer,
  //   },
  // });
});

// Login
exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check for email and password
  if (!email || !password) {
    return next(new AppError('Enter valid Email address and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Incorrect email or password', 404));
  }
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    return next(new AppError('Incorrect email or password!', 401));
  }
  createSendToken(res, user);
  // const token = signToken(user.id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     token,
  //   },
  // });
});

// protect middleware
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check if token exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access', 401));
  }
  // 2) Token verification
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(new AppError('You are logged in, please login to get access', 401));
  }
  // 4) Check if user changed password after the token generation
  if (await currentUser.changedPasswordAfter(decode.iat)) {
    return next(new AppError('User recently changed password, please login again', 401));
  }
  //  Get access to protected route
  req.user = currentUser;
  next();
});

// Restrict to middleware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are not authorised to perform this action', 403));
    }
    next();
  };
};

// Forget password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on email from the user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with this email address', 404));
  }

  // Generate the random token
  const resetToken = await user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // Send it to the user on email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? just click the link ${resetURL} and reset your password.\n 
  If you didn't forget your password, please ignore this email`;

  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset token (valide for 10 minutes)',
      message,
    });
    res.status(200).json({ status: 'success', message: 'Token sent to the Email' });
  } catch (err) {
    console.log(err, 'erorrr');
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Please try again later!', 500));
  }
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get the user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashedToken });
  // If token is not expired and user exists the update the password
  if (!user) {
    next(new AppError('Token is invalid or has expired!!', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  // Log the user in with JWT
  createSendToken(res, user);
  // const token = signToken(user.id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     token,
  //   },
  // });
});

// Update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user form the collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed password is correct
  const correct = await user.correctPassword(req.body.password, user.password);
  if (!correct) {
    return next(new AppError('Incorrect password!!', 401));
  }

  // 3) If so update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  // 4) Log user in, Send JWT
  createSendToken(res, user);
  // const token = signToken(user.id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     token,
  //   },
  // });
});
