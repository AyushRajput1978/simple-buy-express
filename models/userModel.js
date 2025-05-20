const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A user must have a name'],
    trim: true,
    maxLength: 40,
    minLength: 2,
  },
  photo: String,
  email: {
    type: String,
    unique: true,
  },
  phoneNo: {
    type: String,
    unique: true,
    require: [true, 'A user must have a phone number'],
  },
  addresses: [
    {
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    },
  ],
  role: {
    type: String,
    enum: ['superAdmin', 'admin', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'A user must have a password'],
    minLength: [8, 'Password must have 8 characters'],
    maxLength: [16, "A password can't exceed 16 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'A user must have a password'],
    minLength: [8, 'Password must have 8 characters'],
    maxLength: [16, "A password can't exceed 16 characters"],
    validate: {
      // This only works on save and create
      validator: function (el) {
        return this.password === el;
      },
      message: 'Passwords are not same',
    },
  },
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // this only works when password is modified or created
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = async function (jwtTimeStamp) {
  const timeStamp = parseInt(this.passwordChangedAt?.getTime() / 1000, 10);
  if (timeStamp) {
    return jwtTimeStamp < timeStamp;
  }
  return false;
};

// Reset password token generation and encryption
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};
// QUERY MIDDLEWARE: Runs before find() or update()
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
