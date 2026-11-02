
const User = require("../models/User");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const getImageUrl = require("../utils/s3Url");
const { removeProductFromIndex } = require("../utils/productSearch");
const { indexProduct } = require("../utils/productSearch");

// CREATE PRODUCT: approved vendors only
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      imageKey
    } = req.body;
    await indexProduct(product);

    const user = await User.findById(req.user.id);

    if (
      !user ||
      user.role !== "vendor" ||
      user.vendorStatus !== "approved"
    ) {
      return res.status(403).json({
        message: "An approved vendor account is required"
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      imageKey,
      vendorId: req.user.id
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: error.message });
  }
};

// GET ALL PRODUCTS: search, filter and sort

exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    const filter = { status: "active" };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let productIds = null;

    if (search && search.trim()) {
      try {
        const elasticClient = require("../config/elasticsearch");

        const result = await elasticClient.search({
          index: "markethub_products",
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: search.trim(),
                    fields: ["name^3", "description", "category"],
                    fuzziness: "AUTO"
                  }
                }
              ],
              filter: [
                { term: { status: "active" } }
              ]
            }
          },
          size: 1000
        });

        productIds = result.hits.hits.map(
          hit => hit._source.mongoId
        );
      } catch (elasticError) {
        console.error(
          "Elasticsearch search failed; using MongoDB:",
          elasticError.message
        );

        filter.$or = [
          { name: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } }
        ];
      }
    }

    if (productIds !== null) {
      if (productIds.length === 0) {
        return res.status(200).json([]);
      }

      filter._id = { $in: productIds };
    }

    let sortOption = { createdAt: -1 };

    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }
console.log("Product DB:", Product.db.name);
console.log("Product collection:", Product.collection.name);
console.log("Product filter:", filter);
console.log("Total products:", await Product.countDocuments());
    const products = await Product.find(filter)
      .sort(sortOption)
      .lean();

    const productsWithImages = await Promise.all(
      products.map(async (product) => ({
        ...product,
        imageUrl: await getImageUrl(product.imageKey)
      }))
    );

    res.status(200).json(productsWithImages);
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Failed to fetch products"
    });
  }
};


// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      status: "active"
    }).lean();

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    await indexProduct(product);

    product.imageUrl = await getImageUrl(product.imageKey);

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      message: "Failed to fetch product"
    });
  }
};

// GET MY PRODUCTS: logged-in vendor's products
exports.getMyProducts = async (req, res) => {
  try {
      const products = await Product.find({
      vendorId: req.user.id
    })
      .sort({ createdAt: -1 })
      .lean();

    const productsWithImages = await Promise.all(
      products.map(async (product) => ({
        ...product,
        imageUrl: await getImageUrl(product.imageKey)
      }))
    );

    res.status(200).json(productsWithImages);
  } catch (error) {
    console.error("Get my products error:", error);
    res.status(500).json({
      message: "Failed to fetch your products"
    });
  }
};

// UPDATE PRODUCT: owner or admin
exports.updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "stock",
      "imageKey",
      "status"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const filter = { _id: req.params.id };

    if (req.user.role !== "admin") {
      filter.vendorId = req.user.id;
    }

    const product = await Product.findOneAndUpdate(
      filter,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found or access denied"
      });
    }

    res.json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE PRODUCT: owner or admin
exports.deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const filter = { _id: req.params.id };

    if (req.user.role !== "admin") {
      filter.vendorId = req.user.id;
    }

    const product = await Product.findOneAndDelete(filter);
if (product) {
  await removeProductFromIndex(product._id);
}

    if (!product) {
      return res.status(404).json({
        message: "Product not found or access denied"
      });
    }

    res.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: error.message });
  }
};
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch products",
      error: error.message
    });
  }
};
