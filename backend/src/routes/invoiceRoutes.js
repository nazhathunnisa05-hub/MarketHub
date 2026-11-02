
const express = require("express");
const router = express.Router();

const { downloadInvoice } = require("../controllers/invoiceController");
const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

// Customer can download their own invoice
router.get(
  "/:orderId",
  authenticate,
  authorize("customer"),
  downloadInvoice
);

module.exports = router;
