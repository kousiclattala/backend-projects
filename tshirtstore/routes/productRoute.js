const app = require("express");
const router = app.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");
const {
  addProduct,
  getAllProducts,
  adminGetAllProducts,
  getOneProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  addReview,
  deleteReview,
  getReviewsForSingleProduct,
} = require("../controllers/productController");

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);

router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), adminGetAllProducts);

router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct);

// user routes
router.route("/products").get(getAllProducts);
router.route("/product").get(getOneProduct);
router
  .route("/review")
  .put(isLoggedIn, addReview)
  .delete(isLoggedIn, deleteReview);
router.route("/reviews").get(isLoggedIn, getReviewsForSingleProduct);

module.exports = router;
