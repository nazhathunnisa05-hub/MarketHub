
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const redisClient = require("./src/config/redis");
const elasticClient = require("./src/config/elasticsearch");
const createProductIndex = require("./src/config/createProductIndex");

const app = express();

// Import routes
const uploadRoutes = require("./src/routes/uploadRoutes");
const vendorRoutes = require("./src/routes/vendorRoutes");
const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const couponRoutes = require("./src/routes/couponRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

// Keep this import only if invoiceRoutes.js exists
const invoiceRoutes = require("./src/routes/invoiceRoutes");

const { razorpayWebhook } = require("./src/controllers/paymentController");

// CORS middleware

const allowedOrigins = [
  "http://localhost:5173",
  "https://markethub-frontend-two.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
}));

// Razorpay webhook must be before express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

app.use(express.json());

// Register routes
app.use("/api/invoices", invoiceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Marketplace API is running!"
  });
});

// Database health check
app.get("/api/health/db", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    database: connected ? "Connected" : "Disconnected"
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    // Connect Redis
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    console.log("Redis connected successfully!");

    // Connect Elasticsearch
    await elasticClient.ping();
    console.log("Elasticsearch connected successfully");

    // Create product index
    await createProductIndex();

    // Start server only after services connect
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Service startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
