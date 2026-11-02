
const Vendor = require("../models/Vendor");
const User = require("../models/User");

// Customer applies to become a vendor
exports.applyVendor = async (req, res) => {
  try {
    const { storeName, description, businessEmail } = req.body;

    if (
      typeof storeName !== "string" ||
      !storeName.trim() ||
      typeof businessEmail !== "string" ||
      !businessEmail.includes("@")
    ) {
      return res.status(400).json({
        message: "Valid store name and business email are required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot apply as vendors"
      });
    }

    if (user.vendorStatus === "pending" ||
        user.vendorStatus === "approved") {
      return res.status(409).json({
        message: "Vendor application already exists"
      });
    }

    const vendor = await Vendor.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        storeName: storeName.trim(),
        description,
        businessEmail: businessEmail.trim().toLowerCase(),
        approvalStatus: "pending"
      },
      { upsert: true, new: true, runValidators: true }
    );

    user.vendorStatus = "pending";
    await user.save();

    res.status(201).json({
      message: "Vendor application submitted",
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to submit application" });
  }
};

// Admin views pending applications
exports.getPendingVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({
      approvalStatus: "pending"
    }).populate("userId", "name email");

    res.json({ count: vendors.length, vendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin approves or rejects a vendor
exports.reviewVendor = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected"
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor application not found"
      });
    }

    if (vendor.approvalStatus !== "pending") {
      return res.status(409).json({
        message: "Application has already been reviewed"
      });
    }

    const user = await User.findById(vendor.userId);

    if (!user || user.role === "admin") {
      return res.status(409).json({
        message: "Invalid vendor account"
      });
    }

    vendor.approvalStatus = status;
    user.vendorStatus = status;

    if (status === "approved") {
      user.role = "vendor";
    } else {
      user.role = "customer";
    }

    await vendor.save();
    await user.save();

    res.json({
      message: `Vendor application ${status}`,
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to review application" });
  }
};
