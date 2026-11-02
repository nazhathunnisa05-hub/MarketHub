
const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment
} = require("../controllers/paymentController");

const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post(
  "/create-order",
  authenticate,
  authorize("customer"),
  createPaymentOrder
);

router.post(
  "/verify",
  authenticate,
  authorize("customer"),
  verifyPayment
);

module.exports = router;
