
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const redisClient = require("../config/redis");

// Place order
exports.placeOrder = async (req, res) => {
  try {
    const { shippingAddress, couponCode } = req.body;

    const requiredFields = [
      "fullName", "phone", "street", "city", "state", "pincode"
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        field =>
          typeof shippingAddress[field] !== "string" ||
          !shippingAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required"
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findOne({
        _id: cartItem.productId,
        status: "active"
      });

      if (!product) {
        return res.status(400).json({
          message: "A product in your cart is unavailable"
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          message: `${product.name} has insufficient stock`
        });
      }

      const itemSubtotal = product.price * cartItem.quantity;

      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        subtotal: itemSubtotal
      });

      subtotal += itemSubtotal;
    }

    // Coupon validation
    let discountAmount = 0;
    let appliedCouponCode = null;
    let coupon = null;

    if (couponCode && couponCode.trim()) {
      coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() },
        $expr: { $lt: ["$usedCount", "$usageLimit"] }
      });

      if (!coupon) {
        return res.status(400).json({
          message: "Invalid, expired, or exhausted coupon"
        });
      }

      if (subtotal < coupon.minimumOrderAmount) {
        return res.status(400).json({
          message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`
        });
      }

      if (coupon.discountType === "percentage") {
        discountAmount = subtotal * coupon.discountValue / 100;

        if (coupon.maximumDiscount !== null) {
          discountAmount = Math.min(
            discountAmount,
            coupon.maximumDiscount
          );
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      discountAmount = Math.min(discountAmount, subtotal);
      discountAmount = Number(discountAmount.toFixed(2));
      appliedCouponCode = coupon.code;
    }

    const totalAmount = Number(
      (subtotal - discountAmount).toFixed(2)
    );

    // Reduce stock
    for (const item of cart.items) {
      const updatedProduct = await Product.updateOne(
        {
          _id: item.productId,
          status: "active",
          stock: { $gte: item.quantity }
        },
        { $inc: { stock: -item.quantity } }
      );

      if (updatedProduct.modifiedCount !== 1) {
        return res.status(409).json({
          message: "Product stock changed. Please refresh your cart."
        });
      }
    }

    // Create vendor shipments
    const vendorIds = [
      ...new Set(orderItems.map(item => item.vendorId.toString()))
    ];

    const shipments = vendorIds.map(vendorId => ({
      vendorId,
      status: "placed"
    }));

    // Increment coupon usage
    if (coupon) {
      const updatedCoupon = await Coupon.findOneAndUpdate(
        {
          _id: coupon._id,
          isActive: true,
          expiryDate: { $gt: new Date() },
          $expr: { $lt: ["$usedCount", "$usageLimit"] }
        },
        { $inc: { usedCount: 1 } },
        { new: true }
      );

      if (!updatedCoupon) {
        for (const item of cart.items) {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } }
          );
        }

        return res.status(409).json({
          message: "Coupon usage limit reached. Please try again."
        });
      }
    }
    

    // Save order
    let order;

    try {
      order = await Order.create({
        customerId: req.user.id,
        items: orderItems,
        shipments,
        shippingAddress,
        subtotal,
        couponCode: appliedCouponCode,
        discountAmount,
        totalAmount
      });
    } catch (orderError) {
      for (const item of cart.items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } }
        );
      }

      if (coupon) {
        await Coupon.updateOne(
          { _id: coupon._id, usedCount: { $gt: 0 } },
          { $inc: { usedCount: -1 } }
        );
      }

      throw orderError;
    }

    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } }
    );
    // Clear cached cart after successful order placement
if (redisClient.isReady) {
  await redisClient.del(`cart:${req.user.id}`);
}

    return res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).json({ message: error.message });
  }
};


// Get customer orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.user.id
    })
      .populate("items.productId", "name imageKey")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get vendor orders
exports.getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.vendorId": req.user.id
    })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    const vendorOrders = orders.map(order => {
      const vendorItems = order.items.filter(
        item => item.vendorId.toString() === req.user.id
      );

      return {
        ...order.toObject(),
        items: vendorItems
      };
    });

    res.status(200).json(vendorOrders);
  } catch (error) {
    console.error("Get vendor orders error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Update vendor shipment status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["packed", "shipped", "delivered"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shipment = order.shipments.find(
      item => item.vendorId.toString() === req.user.id
    );

    if (!shipment) {
      return res.status(403).json({
        message: "You are not authorized to update this shipment"
      });
    }

    const validNextStatus = {
      placed: "packed",
      packed: "shipped",
      shipped: "delivered"
    };

    if (validNextStatus[shipment.status] !== status) {
      return res.status(400).json({
        message: `Cannot change status from ${shipment.status} to ${status}`
      });
    }

    shipment.status = status;

    const statuses = order.shipments.map(item => item.status);

    if (statuses.every(item => item === "delivered")) {
      order.orderStatus = "delivered";
    } else if (statuses.some(item => item === "shipped")) {
      order.orderStatus = "shipped";
    } else if (statuses.some(item => item === "packed")) {
      order.orderStatus = "packed";
    }

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Temporary export check
console.log("Order controller exports:", {
  placeOrder: typeof module.exports.placeOrder,
  getMyOrders: typeof module.exports.getMyOrders,
  getVendorOrders: typeof module.exports.getVendorOrders,
  updateOrderStatus: typeof module.exports.updateOrderStatus,
  getAllOrdersAdmin: typeof module.exports.getAllOrdersAdmin
});

 
// Admin: view all marketplace orders
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Admin orders error:", error);

    res.status(500).json({
      message: "Unable to fetch marketplace orders"
    });
  }
};
