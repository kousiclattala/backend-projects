const express = require("express");

const router = express.Router();

const { home, testData } = require("../controllers/homeController");
const { signup } = require("../controllers/userController");

router.route("/").get(home);
router.route("/signup").post(signup);
router.route("/test").post(testData);

module.exports = router;
