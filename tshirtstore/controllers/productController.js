const BigPromise = require("../utils/BigPromise");
const cloudinary = require("cloudinary");
const Product = require("../models/productModel");
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  // uploading images

  var imagesArray = [];

  if (!req.files) {
    return res.status(401).json({
      msg: "Please send product images",
    });
  }

  for (let index = 0; index < req.files.photos.length; index++) {
    const result = await cloudinary.v2.uploader.upload(
      req.files.photos[index].tempFilePath,
      {
        folder: "products",
      }
    );

    imagesArray.push({
      id: result.public_id,
      secure_url: result.secure_url,
    });
  }

  req.body.photos = imagesArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    msg: "Product created successfully",
    product,
  });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {
  var resultPerPage = 6;
  const totalProductCount = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base.clone();
  const filteredProductCount = products.length;

  productsObj.pager(resultPerPage);

  // products = await productsObj.base

  res.status(200).json({
    msg: "Filtered products",
    totalProductCount,
    filteredProductCount,
    products,
  });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({
      msg: "Please send id in the url",
    });
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(401).json({
      msg: "No product found with this id",
    });
  }

  res.status(200).json({
    msg: "Product fetched",
    product,
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  var product = await Product.findById(productId);

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const alreadyReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.comment = comment;
        rev.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  // updating the rating

  // array.reduce((prevValue, currValue) => currValue + prevValue, initialValue)
  // here product.reviews is an array
  product.ratings =
    product.reviews.reduce(
      (prevValue, review) => review.rating + prevValue,
      0
    ) / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    msg: "Your review was received",
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  const reviews = product.reviews.filter(
    (rev) => rev.user === req.user._id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce(
      (prevValue, review) => prevValue + review.rating,
      0
    ) / product.reviews.length;

  await Product.findByIdAndUpdate(
    req.query.id,
    {
      reviews,
      numOfReviews,
      ratings,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    msg: "Review deleted successfully",
  });
});

exports.getReviewsForSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    msg: "All reviews for single product",
    reviews: product.reviews,
  });
});

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    msg: "All products fetched",
    products,
  });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  var product = await Product.findById(req.params.id);

  var imagesArray = [];

  if (!product) {
    return res.status(200).json({
      msg: "No product found with this id",
    });
  }

  if (req.files) {
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.v2.uploader.destroy(
        product.photos[index].id
      );
    }

    for (let index = 0; index < req.files.photos.length; index++) {
      const res = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imagesArray.push({
        id: res.public_id,
        secure_url: res.secure_url,
      });
    }
    req.body.photos = imagesArray;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    msg: "Photos updated successfully",
    product,
  });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  var product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      msg: "No product found with this Id",
    });
  }

  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.v2.uploader.destroy(product.photos[index].id);
  }

  product.remove();

  res.status(200).json({
    msg: "Product deleted successfully",
  });
});
