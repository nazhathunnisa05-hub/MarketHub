
const Coupon = require("../models/Coupon");

// Validate coupon for customer checkout
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (
      typeof code !== "string" ||
      !Number.isFinite(orderAmount) ||
      orderAmount <= 0
    ) {
      return res.status(400).json({
        message: "Valid coupon code and order amount are required"
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon code"
      });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({
        message: "Coupon has expired"
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        message: "Coupon usage limit reached"
      });
    }

    if (orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`
      });
    }

    let discount =
      coupon.discountType === "percentage"
        ? (orderAmount * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maximumDiscount !== null) {
      discount = Math.min(discount, coupon.maximumDiscount);
    }

    discount = Math.min(discount, orderAmount);

    res.json({
      message: "Coupon applied successfully",
      code: coupon.code,
      discount: Number(discount.toFixed(2)),
      finalAmount: Number((orderAmount - discount).toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      expiryDate,
      usageLimit
    } = req.body;

    if (
      !code ||
      !["percentage", "fixed"].includes(discountType) ||
      !Number.isFinite(discountValue) ||
      discountValue < 1 ||
      !expiryDate ||
      !Number.isFinite(Date.parse(expiryDate)) ||
      new Date(expiryDate) <= new Date()
    ) {
      return res.status(400).json({
        message: "Please provide valid coupon details and a future expiry date"
      });
    }

    if (
      discountType === "percentage" &&
      discountValue > 100
    ) {
      return res.status(400).json({
        message: "Percentage discount cannot exceed 100"
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.trim().toUpperCase()
    });

    if (existingCoupon) {
      return res.status(409).json({
        message: "Coupon code already exists"
      });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount ?? 0,
      maximumDiscount: maximumDiscount ?? null,
      expiryDate,
      usageLimit: usageLimit ?? 100
    });

    res.status(201).json({
      message: "Coupon created successfully",
      coupon
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.json({
      count: coupons.length,
      coupons
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Activate or deactivate coupon
exports.updateCouponStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false"
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found"
      });
    }

    res.json({
      message: "Coupon status updated successfully",
      coupon
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found"
      });
    }

    res.json({
      message: "Coupon deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
