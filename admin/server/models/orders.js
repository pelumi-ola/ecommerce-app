const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "awaiting_payment",
        "payment_submitted",
        "paid",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    payment: {
      accountName: {
        type: String,
        default: null,
      },

      accountNumber: {
        type: String,
        default: null,
      },

      bankName: {
        type: String,
        default: null,
      },

      paymentDeadline: {
        type: Date,
        default: null,
      },

      paidAt: {
        type: Date,
        default: null,
      },

      paymentReference: {
        type: String,
        default: null,
      },
    },

    tracking: {
      carrier: {
        type: String,
        default: null,
      },

      trackingNumber: {
        type: String,
        default: null,
      },

      estimatedDelivery: {
        type: Date,
        default: null,
      },
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
