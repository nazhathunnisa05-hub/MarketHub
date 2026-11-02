const express = require("express");
const router = express.Router();

const {
  getDashboardStats
} = require("../controllers/adminController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

// Only authenticated admins can access admin routes
router.use(authenticate, authorize("admin"));

router.get("/dashboard", getDashboardStats);

module.exports = router;