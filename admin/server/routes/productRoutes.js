const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/controller");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Nosql routes
router.post("/api/products", authMiddleware, createProduct);
router.get("/api/products", authMiddleware, getAllProducts);
router.get("/api/products/:id", authMiddleware, getProductById);
router.put("/api/products/:id", authMiddleware, updateProduct);
router.delete("/api/products/:id", authMiddleware, deleteProduct);

module.exports = router;
