const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const homerouter = require("./routes/homeRoute");
const userRouter = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const paymentRoute = require("./routes/paymentRoute");
const orderRoute = require("./routes/orderRoute");

const connectToDB = require("./config/db");

connectToDB();

//middlewares
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1", homerouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", productRoute);
app.use("/api/v1", paymentRoute);
app.use("/api/v1", orderRoute);

module.exports = app;
