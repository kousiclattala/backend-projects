const res = require("express/lib/response");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const BigPromise = require("../utils/BigPromise");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    msg: "Your Order placed successfully",
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user")
    .populate("orderItems.product");

  if (!order) {
    return res.status(401).json({
      msg: "No order is found with this Id",
    });
  }

  res.status(200).json({
    msg: "Order fetched successfully",
    order,
  });
});

exports.getLoggedinUserOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find({
    user: req.user._id,
  });

  if (!orders) {
    return res.status(401).json({
      msg: "Please check the order id",
    });
  }

  res.status(200).json({
    msg: "All orders are fetched",
    orders,
  });
});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    msg: "all orders fetched",
    orders,
  });
});

exports.adminUpdateOneOrder = BigPromise(async (req, res, next) => {
  var order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(401).json({
      msg: "No order with this id",
    });
  }

  if (order.orderStatus === "Delivered") {
    return res.status(200).json({
      msg: "Order is delivered and can't be updated",
    });
  }

  await order.orderItems.forEach(async (prod) => {
    await ProductStockUpdate(prod.product, prod.quantity);
  });

  order.orderStatus = req.body.orderStatus;

  await order.save();

  res.status(200).json({
    msg: "Order status updated",
    order,
  });
});

exports.adminDeleteSingleOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.remove();

  res.status(200).json({
    msg: "Order deleted successfully",
  });
});

async function ProductStockUpdate(productId, quantity) {
  var product = await Product.findById(productId);

  if (product.stock == 0) {
    return res.status(401).json({
      msg: "Product is out of stock",
    });
  }

  product.stock = product.stock - quantity;

  await product.save();
}
