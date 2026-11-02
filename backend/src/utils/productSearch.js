const elasticClient = require("../config/elasticsearch");

const INDEX_NAME = "markethub_products";

// Create index if it doesn't exist
const createProductIndex = async () => {
  try {
    const exists = await elasticClient.indices.exists({
      index: INDEX_NAME
    });

    if (!exists) {
      await elasticClient.indices.create({
        index: INDEX_NAME,
        mappings: {
          properties: {
            mongoId: { type: "keyword" },
            name: {
              type: "text",
              fields: {
                keyword: { type: "keyword" }
              }
            },
            description: { type: "text" },
            category: { type: "keyword" },
            price: { type: "double" },
            stock: { type: "integer" },
            status: { type: "keyword" },
            createdAt: { type: "date" }
          }
        }
      });

      console.log("Elasticsearch product index created");
    }
  } catch (error) {
    console.error("Product index error:", error.message);
  }
};

// Add or update a product in Elasticsearch
const indexProduct = async (product) => {
  try {
    await elasticClient.index({
      index: INDEX_NAME,
      id: product._id.toString(),
      document: {
        mongoId: product._id.toString(),
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: product.status,
        createdAt: product.createdAt
      },
      refresh: true
    });
  } catch (error) {
    console.error("Product indexing error:", error.message);
  }
};

// Remove a product from Elasticsearch
const removeProductFromIndex = async (productId) => {
  try {
    await elasticClient.delete({
      index: INDEX_NAME,
      id: productId.toString(),
      refresh: true
    });
  } catch (error) {
    if (error.meta?.statusCode !== 404) {
      console.error("Product removal error:", error.message);
    }
  }
};

module.exports = {
  createProductIndex,
  indexProduct,
  removeProductFromIndex
};