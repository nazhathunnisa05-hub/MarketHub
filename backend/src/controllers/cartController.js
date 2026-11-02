
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const redisClient = require("../config/redis");

const getCartCacheKey = (userId) => `cart:${userId}`;

const invalidateCartCache = async (userId) => {
  try {
    if (redisClient.isReady) {
      await redisClient.del(getCartCacheKey(userId));
    }
  } catch (error) {
    console.error("Cart cache invalidation failed:", error.message);
  }
};

// Get customer's cart
exports.getCart = async (req, res) => {
  try {
    const cacheKey = getCartCacheKey(req.user.id);

    // Check Redis first
    if (redisClient.isReady) {
      try {
        const cachedCart = await redisClient.get(cacheKey);

        if (cachedCart) {
          return res.json(JSON.parse(cachedCart));
        }
      } catch (error) {
        console.error("Redis cache read failed:", error.message);
      }
    }

    // If not cached, fetch from MongoDB
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId");

    const result = cart || { items: [] };

    // Store cart in Redis for 5 minutes
    if (redisClient.isReady) {
      try {
        await redisClient.setEx(
          cacheKey,
          300,
          JSON.stringify(result)
        );
      } catch (error) {
        console.error("Redis cache write failed:", error.message);
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active"
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    const newQuantity = item ? item.quantity + quantity : quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock"
      });
    }

    if (item) {
      item.quantity = newQuantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    await invalidateCartCache(req.user.id);

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.productId");

    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active"
    });

    if (!product || quantity > product.stock) {
      return res.status(400).json({
        message: "Product unavailable or quantity exceeds stock"
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    await invalidateCartCache(req.user.id);

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.productId");

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    await cart.save();

    await invalidateCartCache(req.user.id);

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } }
    );

    await invalidateCartCache(req.user.id);

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
