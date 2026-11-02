const express = require("express");
const router = express.Router();

const {
  addReview,
  getProductReviews
} = require("../controllers/reviewController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

router.get("/:productId", getProductReviews);

router.post(
  "/",
  authenticate,
  authorize("customer"),
  addReview
);

module.exports = router;