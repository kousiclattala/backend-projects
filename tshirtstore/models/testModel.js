const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  name: String,
});

module.exports = mongoose.model("Test", testSchema);
