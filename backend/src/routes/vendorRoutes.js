
const express = require("express");
const router = express.Router();

const {
  applyVendor,
  getPendingVendors,
  reviewVendor
} = require("../controllers/vendorController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

router.post(
  "/apply",
  authenticate,
  authorize("customer"),
  applyVendor
);

router.get(
  "/pending",
  authenticate,
  authorize("admin"),
  getPendingVendors
);

router.patch(
  "/:id/review",
  authenticate,
  authorize("admin"),
  reviewVendor
);

module.exports = router;
