const express = require("express");

const userRouter = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUsers,
  managerAllUsers,
  adminGetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
} = require("../controllers/userController");

const { isLoggedIn, customRole } = require("../middlewares/user");

userRouter.route("/signup").post(signup);
userRouter.route("/login").post(login);
userRouter.route("/logout").get(logout);
userRouter.route("/forgotPassword").post(forgotPassword);
userRouter.route("/password/reset/:token").post(passwordReset);
userRouter.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
userRouter.route("/password/update").post(isLoggedIn, changePassword);
userRouter.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);
userRouter
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminAllUsers);
userRouter
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUsers);

userRouter
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

module.exports = userRouter;
