
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    vendorId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  index: true
},
imageKey: {
  type: String,
  default: null
},
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);
