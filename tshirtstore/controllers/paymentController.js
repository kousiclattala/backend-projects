const BigPromise = require("../utils/BigPromise");

const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Razorpay = require("razorpay");

// if front-end dev wants the api key for stripe
exports.sendStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    msg: "Stripe public Key",
    public_key: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = BigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    automatic_payment_methods: { enabled: true },

    //optional
    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    msg: "Payment captured",
    amount: req.body.amount,
    client_secret: paymentIntent.client_secret,
  });
});

// if front-end dev wants the api key for razorpay
exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    msg: "Razorpay public Key",
    public_key: process.env.RAZORPAY_API_KEY,
  });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: RAZORPAY_API_KEY,
    key_secret: RAZORPAY_SECRET,
  });

  const order = await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
  });

  res.status(200).json({
    msg: "Order created successfully",
    amount: req.body.amount,
    order,
  });
});
