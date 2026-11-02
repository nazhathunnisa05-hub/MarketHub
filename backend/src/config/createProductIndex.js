
const elasticClient = require("./elasticsearch");

const createProductIndex = async () => {
  try {
    const exists = await elasticClient.indices.exists({
      index: "products"
    });

    if (exists) {
      console.log("Elasticsearch product index already exists");
      return;
    }

    await elasticClient.indices.create({
      index: "products",
      mappings: {
        properties: {
          name: { type: "text" },
          description: { type: "text" },
          category: { type: "keyword" },
          price: { type: "float" },
          stock: { type: "integer" },
          vendorId: { type: "keyword" },
          status: { type: "keyword" },
          createdAt: { type: "date" }
        }
      }
    });

    console.log("Elasticsearch product index created");
  } catch (error) {
    console.error("Product index error:", error.message);
  }
};

module.exports = createProductIndex;
