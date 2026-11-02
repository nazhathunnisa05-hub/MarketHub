
const express = require("express");
const router = express.Router();

const {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  updateCouponStatus,
  deleteCoupon
} = require("../controllers/couponController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

// Customer checkout
router.post(
  "/validate",
  authenticate,
  authorize("customer"),
  validateCoupon
);

// Admin coupon management
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createCoupon
);

router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  getAllCoupons
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  updateCouponStatus
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteCoupon
);

module.exports = router;
