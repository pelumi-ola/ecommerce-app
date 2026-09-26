const Product = require("../models/Product");

// Create a single product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body); // insertOne behind the scenes
    res.status(201).json(product);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create product", error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  const products = await Product.find(); // similar to find()
  res.json(products);
};

// Get one product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // find by MongoDB ObjectId
    if (!product) return res.status(404).json({ message: "product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID format" });
  }
};

// Update an product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated document
      runValidators: true, // validate against schema
    });
    if (!product) return res.status(404).json({ message: "product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// Delete an product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "product not found" });
    res.json({ message: "product deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed", error: err.message });
  }
};
