const Order = require("../models/orders");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orders = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("verifiedBy", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

exports.verifyOrder = async (req, res) => {
  try {
    const { accountName, accountNumber, bankName } = req.body;

    if (!accountName || !accountNumber || !bankName) {
      return res.status(400).json({
        message: "Account name, account number and bank name are required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Only pending orders can be verified",
      });
    }

    const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

    order.status = "awaiting_payment";

    order.payment = {
      accountName,
      accountNumber,
      bankName,
      paymentDeadline,
      paidAt: null,
      paymentReference: null,
    };

    order.verifiedBy = req.user.id;
    order.verifiedAt = new Date();

    await order.save();

    res.json({
      message: "Order verified successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify order",
      error: error.message,
    });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "payment_submitted") {
      return res.status(400).json({
        message: "Order does not have a submitted payment",
      });
    }

    order.status = "paid";
    order.payment.paidAt = new Date();

    await order.save();

    res.json({
      message: "Payment confirmed successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to confirm payment",
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, carrier, trackingNumber, estimatedDelivery } = req.body;

    const allowedStatuses = ["processing", "shipped", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;

    if (carrier !== undefined) {
      order.tracking.carrier = carrier;
    }

    if (trackingNumber !== undefined) {
      order.tracking.trackingNumber = trackingNumber;
    }

    if (estimatedDelivery !== undefined) {
      order.tracking.estimatedDelivery = estimatedDelivery;
    }

    await order.save();

    res.json({
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
};
