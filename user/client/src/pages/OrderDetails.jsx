import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

const formatCurrency = (amount) => {
  return `₦${Number(amount || 0).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString();
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const [paymentReference, setPaymentReference] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/orders/${id}`);

      setOrder(response.data.data || response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrder();
  }, [id]);

  const cancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.patch(`/orders/${id}/cancel`);

      setSuccess("Order cancelled successfully.");

      await getOrder();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const submitPayment = async (event) => {
    event.preventDefault();

    if (!paymentReference.trim()) {
      setError("Please enter your payment reference.");
      return;
    }

    try {
      setSubmittingPayment(true);
      setError("");
      setSuccess("");

      const response = await api.patch(`/orders/${id}/payment`, {
        paymentReference: paymentReference.trim(),
      });

      setOrder(response.data.data || response.data);

      setPaymentReference("");

      setSuccess(
        "Payment submitted successfully. Your payment is now waiting for confirmation.",
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <main className="container section">
        <div className="loading">Loading order...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="container section">
        <div className="error">{error || "Order not found"}</div>

        <button className="btn" onClick={() => navigate("/orders")}>
          Back to orders
        </button>
      </main>
    );
  }

  const canCancel =
    order.status === "pending" || order.status === "awaiting_payment";

  const isAwaitingPayment = order.status === "awaiting_payment";

  const isPaymentSubmitted = order.status === "payment_submitted";

  return (
    <main className="container narrow section">
      <Link to="/orders" className="back-link">
        ← My orders
      </Link>

      <div className="order-detail">
        {/* HEADER */}
        <div className="order-header">
          <div>
            <span className="eyebrow">ORDER</span>

            <h1>#{order._id.slice(-8).toUpperCase()}</h1>
          </div>

          <span className={`status status-${order.status}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        <p className="muted">Created {formatDate(order.createdAt)}</p>

        {/* ERROR / SUCCESS */}
        {error && <div className="error">{error}</div>}

        {success && <div className="notice">{success}</div>}

        {/* ORDER ITEMS */}
        <div className="order-lines">
          {order.items.map((item, index) => (
            <div className="checkout-item" key={`${item.productId}-${index}`}>
              <div>
                <strong>{item.name}</strong>

                <p>
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>

              <strong>
                {formatCurrency(Number(item.price) * item.quantity)}
              </strong>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="checkout-total">
          <span>Total</span>

          <strong>{formatCurrency(order.totalAmount)}</strong>
        </div>

        {/* PENDING */}
        {order.status === "pending" && (
          <div className="order-status-panel">
            <h2>Order submitted</h2>

            <p>
              Your order has been submitted and is waiting for verification.
            </p>

            <p className="muted">
              You will receive payment instructions once the order has been
              verified.
            </p>
          </div>
        )}

        {/* AWAITING PAYMENT */}
        {isAwaitingPayment && order.payment && (
          <div className="payment-panel">
            <div className="payment-panel-header">
              <div>
                <span className="eyebrow">PAYMENT REQUIRED</span>

                <h2>Make your payment</h2>
              </div>
            </div>

            <div className="payment-deadline">
              <strong>Payment deadline</strong>

              <span>{formatDate(order.payment.paymentDeadline)}</span>
            </div>

            <div className="bank-details">
              <div className="detail-row">
                <span>Bank name</span>

                <strong>{order.payment.bankName}</strong>
              </div>

              <div className="detail-row">
                <span>Account name</span>

                <strong>{order.payment.accountName}</strong>
              </div>

              <div className="detail-row">
                <span>Account number</span>

                <strong>{order.payment.accountNumber}</strong>
              </div>

              <div className="detail-row">
                <span>Amount to pay</span>

                <strong>{formatCurrency(order.totalAmount)}</strong>
              </div>
            </div>

            <form className="payment-form" onSubmit={submitPayment}>
              <label htmlFor="paymentReference">Payment reference</label>

              <input
                id="paymentReference"
                type="text"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Enter your transfer reference"
                disabled={submittingPayment}
              />

              <button
                type="submit"
                className="btn primary"
                disabled={submittingPayment}
              >
                {submittingPayment ? "Submitting..." : "Submit Payment"}
              </button>
            </form>

            <p className="muted payment-note">
              After submitting your payment reference, an administrator will
              verify and confirm the payment.
            </p>
          </div>
        )}

        {/* PAYMENT SUBMITTED */}
        {isPaymentSubmitted && (
          <div className="order-status-panel">
            <span className="status status-payment_submitted">
              Payment submitted
            </span>

            <h2>Payment is being reviewed</h2>

            <p>
              We have received your payment submission. Your order will continue
              once the payment has been confirmed.
            </p>

            {order.payment?.paymentReference && (
              <div className="detail-row">
                <span>Payment reference</span>

                <strong>{order.payment.paymentReference}</strong>
              </div>
            )}
          </div>
        )}

        {/* PAID */}
        {order.status === "paid" && (
          <div className="order-status-panel">
            <span className="status status-paid">Payment confirmed</span>

            <h2>Payment confirmed</h2>

            <p>
              Your payment has been confirmed. Your order is ready to be
              processed.
            </p>

            {order.payment?.paidAt && (
              <p className="muted">
                Confirmed on {formatDate(order.payment.paidAt)}
              </p>
            )}
          </div>
        )}

        {/* PROCESSING */}
        {order.status === "processing" && (
          <div className="order-status-panel">
            <span className="status status-processing">Processing</span>

            <h2>Your order is being prepared</h2>

            <p>
              Your payment has been confirmed and your order is currently being
              prepared for shipment.
            </p>
          </div>
        )}

        {/* SHIPPED */}
        {order.status === "shipped" && (
          <div className="tracking-panel">
            <span className="status status-shipped">Shipped</span>

            <h2>Your order has been shipped</h2>

            <p>Your order is on its way.</p>

            <div className="tracking-details">
              {order.tracking?.carrier && (
                <div className="detail-row">
                  <span>Carrier:</span>

                  <strong style={{ marginLeft: "10px" }}>
                    {order.tracking.carrier}
                  </strong>
                </div>
              )}

              {order.tracking?.trackingNumber && (
                <div className="detail-row">
                  <span>Tracking number: </span>

                  <strong style={{ marginLeft: "10px" }}>
                    {order.tracking.trackingNumber}
                  </strong>
                </div>
              )}

              {order.tracking?.estimatedDelivery && (
                <div className="detail-row">
                  <span>Estimated delivery:</span>

                  <strong style={{ marginLeft: "10px" }}>
                    {formatDate(order.tracking.estimatedDelivery)}
                  </strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMPLETED */}
        {order.status === "completed" && (
          <div className="order-status-panel">
            <span className="status status-completed">Completed</span>

            <h2>Order completed</h2>

            <p>Your order has been successfully completed.</p>
          </div>
        )}

        {/* CANCELLED */}
        {order.status === "cancelled" && (
          <div className="order-status-panel cancelled-panel">
            <span className="status status-cancelled">Cancelled</span>

            <h2>Order cancelled</h2>

            {order.cancellationReason && (
              <p>
                Reason: <strong>{order.cancellationReason}</strong>
              </p>
            )}

            {order.cancelledAt && (
              <p className="muted">
                Cancelled on {formatDate(order.cancelledAt)}
              </p>
            )}
          </div>
        )}

        {/* CANCEL BUTTON */}
        {canCancel && (
          <div className="order-actions">
            <button className="btn danger" onClick={cancelOrder}>
              Cancel order
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
