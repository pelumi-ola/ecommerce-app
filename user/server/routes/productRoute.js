const express = require("express");
const {
  getAllProducts,
  getProductById,
} = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} = require("../controllers/cartController");

const router = express.Router();

router.get("/api/product", getAllProducts);
router.get("/api/product/:id", authMiddleware, getProductById);
router.post("/api/cart", authMiddleware, addToCart);
router.get("/api/cart", authMiddleware, getCart);
router.put("/api/cart/:productId", authMiddleware, updateCartItem);
router.delete("/api/cart/:productId", authMiddleware, removeFromCart);

module.exports = router;
