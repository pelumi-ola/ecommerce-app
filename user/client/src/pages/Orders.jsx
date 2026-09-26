import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";

const statusLabels = {
  pending: "Pending verification",
  awaiting_payment: "Awaiting payment",
  payment_submitted: "Payment submitted",
  paid: "Payment confirmed",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusDescriptions = {
  pending: "Your order has been submitted and is waiting for verification.",
  awaiting_payment: "Your order has been verified. Please make payment.",
  payment_submitted:
    "Your payment has been submitted and is waiting for confirmation.",
  paid: "Your payment has been confirmed.",
  processing: "Your order is being prepared.",
  shipped: "Your order has been shipped.",
  completed: "Your order has been completed.",
  cancelled: "This order has been cancelled.",
};

const formatCurrency = (amount) => {
  return `₦${Number(amount || 0).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString();
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getOrders = async () => {
    try {
      setError("");

      const response = await api.get("/orders");

      setOrders(response.data.data || response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const cancelOrder = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.patch(`/orders/${id}/cancel`);

      await getOrders();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <main className="container section">
      <div className="section-title">
        <div>
          <span className="eyebrow">PURCHASE HISTORY</span>

          <h1>My Orders</h1>
        </div>

        <Link to="/" className="btn secondary">
          Shop
        </Link>
      </div>

      {loading && <div className="loading">Loading orders...</div>}

      {error && <div className="error">{error}</div>}

      {!loading && orders.length === 0 && (
        <div className="empty">
          <h2>No orders yet</h2>

          <p>Your submitted orders will appear here.</p>

          <Link to="/" className="btn primary">
            Start Shopping
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="orders">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-main">
                <div className="order-header">
                  <div>
                    <span className={`status status-${order.status}`}>
                      {statusLabels[order.status] || order.status}
                    </span>

                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>

                    <p>Placed {formatDate(order.createdAt)}</p>
                  </div>

                  <strong className="order-total">
                    {formatCurrency(order.totalAmount)}
                  </strong>
                </div>

                <p className="order-description">
                  {statusDescriptions[order.status]}
                </p>

                {order.status === "awaiting_payment" &&
                  order.payment?.paymentDeadline && (
                    <div className="payment-warning">
                      <strong>Payment required</strong>

                      <p>Payment must be completed before:</p>

                      <strong>
                        {formatDate(order.payment.paymentDeadline)}
                      </strong>
                    </div>
                  )}

                {order.status === "payment_submitted" && (
                  <div className="payment-info">
                    <strong>Payment submitted</strong>

                    {order.payment?.paymentReference && (
                      <p>Reference: {order.payment.paymentReference}</p>
                    )}

                    <p>Your payment is waiting for admin confirmation.</p>
                  </div>
                )}

                {order.status === "shipped" && (
                  <div className="tracking-info">
                    <strong>Your order has been shipped</strong>

                    {order.tracking?.carrier && (
                      <p>Carrier: {order.tracking.carrier}</p>
                    )}

                    {order.tracking?.trackingNumber && (
                      <p>Tracking number: {order.tracking.trackingNumber}</p>
                    )}

                    {order.tracking?.estimatedDelivery && (
                      <p>
                        Estimated delivery:{" "}
                        {formatDate(order.tracking.estimatedDelivery)}
                      </p>
                    )}
                  </div>
                )}

                {order.status === "cancelled" && (
                  <div className="cancelled-info">
                    <strong>Order cancelled</strong>

                    {order.cancellationReason && (
                      <p>Reason: {order.cancellationReason}</p>
                    )}
                  </div>
                )}

                <div className="order-actions">
                  <Link to={`/orders/${order._id}`} className="btn secondary">
                    View Details
                  </Link>

                  {(order.status === "pending" ||
                    order.status === "awaiting_payment") && (
                    <button
                      className="danger-link"
                      onClick={() => cancelOrder(order._id)}
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.status === "awaiting_payment" && (
                    <Link to={`/orders/${order._id}`} className="btn primary">
                      Make Payment
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
