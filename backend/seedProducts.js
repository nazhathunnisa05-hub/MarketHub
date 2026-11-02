require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./src/models/Product");

const vendorId = "6ae4d1dd3083dbb7b0a3024b";

const products = [
  {
    vendorId,
    name: "Wireless Bluetooth Speaker",
    description: "Portable wireless speaker with clear sound and deep bass.",
    price: 1999,
    category: "Electronics",
    stock: 15
  },
  {
    vendorId,
    name: "Smart Watch",
    description: "Smart watch with fitness tracking and notifications.",
    price: 2499,
    category: "Electronics",
    stock: 10
  },
  {
    vendorId,
    name: "Men's Casual T-Shirt",
    description: "Comfortable cotton casual T-shirt for everyday wear.",
    price: 599,
    category: "Fashion",
    stock: 25
  },
  {
    vendorId,
    name: "Women's Handbag",
    description: "Stylish handbag suitable for everyday use.",
    price: 1299,
    category: "Fashion",
    stock: 12
  },
  {
    vendorId,
    name: "Ceramic Coffee Mug",
    description: "Durable ceramic coffee mug for home and office.",
    price: 299,
    category: "Home & Kitchen",
    stock: 30
  },
  {
    vendorId,
    name: "LED Desk Lamp",
    description: "Modern LED desk lamp for study and office use.",
    price: 899,
    category: "Home & Kitchen",
    stock: 18
  }
];

async function seedProducts() {
  try {
await mongoose.connect(process.env.MONGODB_URI.replace(
  "/marketplace",
  "/markethub"
));
    console.log("MongoDB connected");

    const existingProducts = await Product.countDocuments({ vendorId });

    if (existingProducts > 0) {
      console.log("This vendor already has products. No products inserted.");
      return;
    }

    await Product.insertMany(products);

    console.log("6 sample products inserted successfully!");
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();