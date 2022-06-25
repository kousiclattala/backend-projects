const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide product name"],
    trim: true,
    maxlength: [
      120,
      "please provide product name not more than 120 characters",
    ],
  },
  price: {
    type: Number,
    required: [true, "please provide product price"],
    maxlength: [5, "please provide product price not more than 5 digits"],
  },
  description: {
    type: String,
    required: [true, "please provide product description"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Please provide product category from - short-sleeves, long-sleeves, sweat-shirts and hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirts", "hoodies"],
      message:
        "Please provide product category from - short-sleeves, long-sleeves, sweat-shirts and hoodies",
    },
  },
  stock: {
    type: Number,
    required: [true, "Please provide the stock of the product"],
  },
  brand: {
    type: String,
    required: [true, "Please provide product clothing brand"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        default: 0,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Product", productSchema);
