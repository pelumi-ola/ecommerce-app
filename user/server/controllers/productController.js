const productmodel = require("../models/product");

// Get all products
exports.getAllProducts = async (req, res) => {
  const products = await productmodel.find(); // similar to find()
  res.json(products);
};

// Get one product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await productmodel.findById(req.params.id); // find by MongoDB ObjectId
    if (!product) return res.status(404).json({ message: "product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID format" });
  }
};
