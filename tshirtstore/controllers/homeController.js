const Test = require("../models/testModel");

exports.home = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Home route from API",
  });
};

exports.testData = async (req, res) => {
  const { name } = req.body;

  const result = await Test.create({
    name,
  });

  res.status(200).json(result);
};
