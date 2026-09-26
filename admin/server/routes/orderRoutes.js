const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getOrderById,
  verifyOrder,
  confirmPayment,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/api/admin/orders", authMiddleware, getAllOrders);
router.get("/api/admin/orders", authMiddleware, getOrderById);
router.patch("/api/admin/orders/:id/verify", authMiddleware, verifyOrder);
router.patch(
  "/api/admin/orders/:id/confirm-payment",
  authMiddleware,
  confirmPayment,
);
router.patch("/api/admin/orders/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;
