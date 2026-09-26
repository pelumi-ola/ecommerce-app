const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder,
  submitPayment,
} = require("../controllers/orderController");

// Checkout
router.post("/api/checkout", authMiddleware, checkout);

// Orders
router.get("/api/orders", authMiddleware, getMyOrders);

router.get("/api/orders/:id", authMiddleware, getOrderById);

router.patch("/api/orders/:id/cancel", authMiddleware, cancelOrder);
router.patch("/api/orders/:id/payment", authMiddleware, submitPayment);

module.exports = router;
