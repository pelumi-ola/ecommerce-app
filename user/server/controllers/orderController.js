const Cart = require("../models/carts");
const Product = require("../models/product");
const Order = require("../models/orders");

// Checkout
exports.checkout = async (req, res) => {
  try {
    // 1. Find the logged-in user's cart
    const cart = await Cart.findOne({
      userId: req.user.id,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    // 2. Get every product from the database
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product ${item.productId} not found`,
        });
      }

      // 3. Check product availability
      if (!product.inStock) {
        return res.status(400).json({
          message: `${product.name} is out of stock`,
        });
      }

      // 4. Calculate price on the SERVER
      const itemTotal = product.price * item.quantity;

      totalAmount += itemTotal;

      // 5. Save product information at time of purchase
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // 6. Create order
    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalAmount,
    });

    // 7. Clear the cart
    cart.items = [];
    await cart.save();

    // 8. Return order
    res.status(201).json({
      message: "Checkout successful",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Checkout failed",
      error: error.message,
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

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
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      message: "Invalid order ID",
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const cancellableStatuses = ["pending", "awaiting_payment"];

    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message: "This order can no longer be cancelled",
      });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = "Cancelled by user";

    await order.save();

    res.json({
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      message: "Invalid order ID",
    });
  }
};

exports.submitPayment = async (req, res) => {
  try {
    const { paymentReference } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "awaiting_payment") {
      return res.status(400).json({
        message: "This order is not awaiting payment",
      });
    }

    if (
      order.payment.paymentDeadline &&
      new Date() > new Date(order.payment.paymentDeadline)
    ) {
      order.status = "cancelled";
      order.cancelledAt = new Date();
      order.cancellationReason = "Payment deadline expired";

      await order.save();

      return res.status(400).json({
        message: "Payment deadline has expired. This order has been cancelled.",
      });
    }

    order.status = "payment_submitted";

    order.payment.paymentReference = paymentReference || null;

    await order.save();

    res.json({
      message: "Payment submitted successfully. Waiting for confirmation.",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit payment",
      error: error.message,
    });
  }
};
