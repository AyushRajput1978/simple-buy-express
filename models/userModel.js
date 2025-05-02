const mongoose = require('mongoose');
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
  },
});

userSchema.pre('save', async function (next) {
  // this only works when password is modified or created
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
