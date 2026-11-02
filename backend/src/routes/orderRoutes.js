const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  getAllOrdersAdmin
} = require("../controllers/orderController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

// Customer: place order
router.post("/", authenticate, authorize("customer"), placeOrder);

// Customer: view own orders
router.get("/my-orders", authenticate, authorize("customer"), getMyOrders);

// Vendor: view vendor orders
router.get("/vendor", authenticate, authorize("vendor"), getVendorOrders);

// Vendor: update order status
router.patch(
  "/:id/status",
  authenticate,
  authorize("vendor"),
  updateOrderStatus
);

// Admin: view all marketplace orders
router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  getAllOrdersAdmin
);

module.exports = router;