const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number
      }
    ],
shipments: [
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["placed", "packed", "shipped", "delivered"],
      default: "placed"
    }
  }
],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },

    totalAmount: {
      type: Number,
      required: true,
      min:0,
    },
    subtotal: {
  type: Number,
  required: true,
  min: 0
},

couponCode: {
  type: String,
  default: null
},

discountAmount: {
  type: Number,
  default: 0,
  min: 0
},

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    razorpayOrderId: {
  type: String,
  default: null
},

razorpayPaymentId: {
  type: String,
  default: null
},

    orderStatus: {
      type: String,
      enum: ["placed", "packed", "shipped", "delivered", "cancelled"],
      default: "placed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);