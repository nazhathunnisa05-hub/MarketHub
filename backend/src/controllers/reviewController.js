const Review = require("../models/Review");
const Order = require("../models/Order");

// Add product review
exports.addReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (
      !productId ||
      !orderId ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a valid product, order, rating and comment"
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customerId: req.user.id,
      orderStatus: "delivered",
      "items.productId": productId
    });

    if (!order) {
      return res.status(403).json({
        message: "You can review a product only after its order is delivered"
      });
    }

    const review = await Review.create({
      productId,
      customerId: req.user.id,
      orderId,
      rating,
      comment: comment.trim()
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this product in this order"
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId
    })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating = totalReviews
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        totalReviews
      : 0;

    res.json({
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      reviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};