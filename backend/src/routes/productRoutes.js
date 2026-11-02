const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getAllProductsAdmin
} = require("../controllers/productController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

// Vendor: view own products
router.get(
  "/my-products",
  authenticate,
  authorize("vendor"),
  getMyProducts
);

// Admin: view all products
router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  getAllProductsAdmin
);

// Public: view all products
router.get("/", getProducts);

// Public: view one product
router.get("/:id", getProductById);

// Vendor: create product
router.post("/", authenticate, authorize("vendor"), createProduct);

// Vendor/Admin: update product
router.put(
  "/:id",
  authenticate,
  authorize("vendor", "admin"),
  updateProduct
);

// Vendor/Admin: delete product
router.delete(
  "/:id",
  authenticate,
  authorize("vendor", "admin"),
  deleteProduct
);

module.exports = router;