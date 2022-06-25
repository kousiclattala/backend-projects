const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  profilePic: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
