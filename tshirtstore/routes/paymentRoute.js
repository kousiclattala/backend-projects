const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/user");
const {
  sendStripeKey,
  sendRazorpayKey,
  captureStripePayment,
  captureRazorpayPayment,
} = require("../controllers/paymentController");

router.route("stripekey").get(isLoggedIn, sendStripeKey);
router.route("razorpaykey").get(isLoggedIn, sendRazorpayKey);

router.route("captureStripePayment").get(isLoggedIn, captureStripePayment);
router.route("captureRazorpayPayment").get(isLoggedIn, captureRazorpayPayment);

module.exports = router;
