
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Get admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      customers,
      vendors,
      products,
      orders,
      revenueResult
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "vendor" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" }
          }
        }
      ])
    ]);

    const revenue = revenueResult.length > 0
      ? revenueResult[0].totalRevenue
      : 0;

    res.json({
      customers,
      vendors,
      products,
      orders,
      revenue
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      message: "Unable to fetch dashboard statistics"
    });
  }
};
