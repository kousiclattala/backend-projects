const User = require("../models/userModel");
const BigPromise = require("../utils/BigPromise");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/mailHelper");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res) => {
  // getting email, password from user
  const { name, email, password } = req.body;

  // getting files from the user
  const file = req.files.photo;

  // if no file present, we will raise a error.
  if (!file) {
    return res.status(400).json({
      message: "Please include profile picture",
    });
  }

  // if no email, name, password present we will raise error.
  if (!(name || email || password)) {
    return res.status(400).json({
      message: "Please include all fields",
    });
  }

  // if file present, store it in the cloud, here we are using cloudinary.
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "tshirts",
  });

  // save the user to the DB along with the photo url coming from cloudinary.
  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  // generate a token and set the password field to null and send it to the front-end.
  const token = user.generateToken();
  user.password = undefined;

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

exports.login = BigPromise(async (req, res) => {
  // getting the email, password fileds from the user
  const { email, password } = req.body;

  // if not found, we will raise error.
  if (!(email || password)) {
    return res.status(400).json({
      err: "Please include email and password",
    });
  }

  // checking whether the user is present or not.
  const user = await User.findOne({ email });

  // if no user found, we will raise a error.
  if (!user) {
    return res.status(400).json({
      err: "Email or password does not match",
    });
  }

  // if user present, verify the password is correct or not.
  const isPasswordCorrect = await user.verifyPassword(password);

  // if password is not correct, we will raise a error.
  if (!isPasswordCorrect) {
    return res.status(400).json({
      err: "Email or password does not match",
    });
  }

  // generate a token, and send it along with the user to the front-end.
  const token = user.generateToken();
  user.password = undefined;

  res.status(200).json({
    message: "Logged in Successfully",
    token,
    user,
  });
});

exports.logout = BigPromise((req, res) => {
  // removing the token
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

exports.forgotPassword = BigPromise(async (req, res) => {
  const { email } = req.body;

  // checking whether user is present in Db or not.
  const user = await User.findOne({ email });

  // if user not found, we will raise issue
  if (!user) {
    return res.status(400).json({ message: "User Not Found" });
  }

  // generating forgot password token
  const forgotToken = user.generateForgotPasswordToken();

  // save the user to the DB, we are giving flag to validatebeforesave save, because
  // there maybe some fields in the model which we marked as required, to override that.
  await user.save({ validateBeforeSave: false });

  // generating the url, to send with the email
  const forgotPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  // generating message to send with the email
  const message =
    "Hello Dear User, \n \n We hope you are doing fine. \n \n By having too many accounts and remembering all those passwords is very painful. \n \n You can reset your account password by clicking on the below link \n \n";

  // by using mail helper method, we will send the mail using that.
  // we are using try/catch block, because mails maybe sent successfully or may get error.
  try {
    await mailHelper({
      toEmail: user.email,
      subject: "Forgot Password Email - Draft T-Shirt store",
      text: message,
      url: forgotPasswordUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    // making the forgotPasswordToken and forgotPasswordTokenExpiry to null
    // so that we can check and send the mail again if it failed for the first time.
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      error,
      message: "Error in sending mail",
    });
  }
});

exports.passwordReset = BigPromise(async (req, res) => {
  // getting the token from url
  const token = req.params.token;

  // hashing the token coming from url
  const encryptToken = crypto.createHash("sha256").update(token).digest("hex");

  // finding whether user is present in our db or not using encrypted token
  // and also based on the expiration date.
  const user = await User.findOne({
    encryptToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  // if no user found we will send the error response
  if (!user) {
    return res.status(400).json({
      message: "Token is invalid or expired",
    });
  }

  // if user found and it is not expired, we are making null of forgotPasswordToken
  // and forgotPasswordTokenExipry
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  // if no password present is sent we will raise a error.
  if (!req.body.password) {
    return res.status(400).json({
      message: "Please enter Password",
    });
  }

  // saving the new password to the DB
  user.password = req.body.password;

  //  here password is saved in encrypted format, becuase we are writing the pre method
  // in the model itself that encrypt the password before saving it to the DB.
  // thats why we are not writing encryption logic here.
  await user.save();

  // before sending the user data back, we are telling the mongoose to remove the password field.
  user.password = undefined;

  res.status(200).json({
    message: "Password reset successfully",
    user,
  });
});

exports.getLoggedInUserDetails = BigPromise(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  var userId = req.user.id;

  var user = await User.findById(userId).select("+password");

  var isOldPasswordCorrect = await user.verifyPassword(req.body.oldPassword);

  if (!isOldPasswordCorrect) {
    return res.status(400).json({
      msg: "Old password is incorrect",
    });
  }

  user.password = req.body.newPassword;

  await user.save();

  user.password = undefined;

  res.status(200).json({
    user,
  });
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  if (!req.body.name || !req.body.email) {
    return res.status(400).json({
      msg: "No data is received",
    });
  }

  var newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);

    const imageId = user.photo.id;

    const imageDeleteResp = await cloudinary.v2.uploader.destroy(imageId);

    const newImageUploadResp = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "tshirts",
      }
    );

    newData.photo = {
      id: newImageUploadResp.public_id,
      secure_url: newImageUploadResp.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
  });

  user.password = undefined;

  res.status(200).json({
    msg: "User data updated successfully",
    user,
  });
});

exports.adminAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find();

  users.forEach((user) => (user.password = undefined));

  res.status(200).json({
    msg: "All users fetched",
    users,
  });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      msg: "No user found",
    });
  }

  res.status(200).json({
    msg: "User fetched",
    user,
  });
});

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const updatedUser = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
  });

  // console.log("updateduser | ", updatedUser);

  // res.status(200).json({
  //   msg: "User data updated",
  // });

  if (updatedUser == null) {
    return res.status(404).json({
      msg: "No user found",
    });
  } else {
    return res.status(200).json({
      msg: "User Data updated",
    });
  }
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      res: "User Not found",
    });
  }

  const imageId = user.photo.id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    msg: "User removed successfully",
  });
});

exports.managerAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    msg: "Fetched all users",
    users,
  });
});
