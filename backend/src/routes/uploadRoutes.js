const express = require("express");
const router = express.Router();

const { uploadImage } = require("../controllers/uploadController");
const upload = require("../middleware/uploadMiddleware");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post(
  "/image",
  authenticate,
  authorize("vendor"),
  upload.single("image"),
  uploadImage
);

module.exports = router;