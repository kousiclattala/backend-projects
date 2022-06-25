const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [6, "Name should of minimum 6 characters long"],
    maxlength: [40, "Name should be of 40 characters long"],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Please provide valid Email Address"],
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password should be of minimum 6 characters long"],
    maxlength: [20, "Password should be of maximum 20 characters long"],
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: String,
  passwordResetToken: String,
  passwordExpiryDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.verifyPassword = async function (userSendPassword) {
  return await bcrypt.compare(userSendPassword, this.password);
};

userSchema.methods.generateToken = function () {
  let token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  return token;
};

userSchema.methods.generateForgotPasswordToken = function () {
  // generate random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  // hashing the generated token and storing it into the DB
  // when user sends the token from frontend we need to do the same hashing and checks
  // whether the token is valid or not.

  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  // generating forgotPasswordTokenExpiry time
  this.forgotPasswordTokenExpiry = Date.now() + 20 * 60 * 1000;

  // sending the un-hashed value
  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
