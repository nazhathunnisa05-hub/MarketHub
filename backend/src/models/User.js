
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },

    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer"
    },
    vendorStatus: {
  type: String,
  enum: ["not_applied", "pending", "approved", "rejected"],
  default: "not_applied"
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
