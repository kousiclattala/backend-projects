const User = require("../models/userModel");
const BigPromise = require("../utils/BigPromise");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  if (!(req.body.token || req.header("Authorization"))) {
    return res.status(401).json({
      message: "You are not authorized",
    });
  }

  const token =
    req.body.token || req.header("Authorization").replace("Bearer ", "");

  // console.log(token);

  if (token == "Bearer") {
    return res.status(401).json({
      message: "Auth Token is missing",
    });
  }

  const decode = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decode.id);

  next();
});

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: "You're not authorized",
      });
    }

    next();
  };
};
