import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  Check,
  ChevronRight,
  Clock,
  Package,
  RefreshCw,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";

import {
  confirmPayment,
  getOrders,
  updateOrderStatus,
  verifyOrder,
} from "../services/orderService";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "status-pending",
  },
  awaiting_payment: {
    label: "Awaiting payment",
    className: "status-awaiting",
  },
  payment_submitted: {
    label: "Payment submitted",
    className: "status-submitted",
  },
  paid: {
    label: "Paid",
    className: "status-paid",
  },
  processing: {
    label: "Processing",
    className: "status-processing",
  },
  shipped: {
    label: "Shipped",
    className: "status-shipped",
  },
  completed: {
    label: "Completed",
    className: "status-completed",
  },
  cancelled: {
    label: "Cancelled",
    className: "status-cancelled",
  },
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const getOrderId = (order) => order?._id || order?.id;

const getCustomerName = (order) => {
  if (order?.userId?.name) return order.userId.name;
  if (order?.userId?.email) return order.userId.email;

  return "Unknown customer";
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modal, setModal] = useState(null);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  const [trackingForm, setTrackingForm] = useState({
    carrier: "",
    trackingNumber: "",
    estimatedDelivery: "",
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOrders();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = getCustomerName(order).toLowerCase();
      const email = order?.userId?.email?.toLowerCase() || "";
      const id = getOrderId(order)?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        customer.includes(query) ||
        email.includes(query) ||
        id.includes(query);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      paymentSubmitted: orders.filter((o) => o.status === "payment_submitted")
        .length,
      paid: orders.filter((o) =>
        ["paid", "processing", "shipped"].includes(o.status),
      ).length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  const openOrder = (order) => {
    setSelectedOrder(order);
    setModal("details");
  };

  const closeModal = () => {
    if (actionLoading) return;

    setModal(null);
    setSelectedOrder(null);
  };

  const showNotice = (message) => {
    setNotice(message);

    setTimeout(() => {
      setNotice("");
    }, 3000);
  };

  const openVerify = (order) => {
    setSelectedOrder(order);

    setPaymentForm({
      accountName: "",
      accountNumber: "",
      bankName: "",
    });

    setModal("verify");
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      setError("");

      const updatedOrder = await verifyOrder(
        getOrderId(selectedOrder),
        paymentForm,
      );

      setOrders((current) =>
        current.map((order) =>
          getOrderId(order) === getOrderId(updatedOrder) ? updatedOrder : order,
        ),
      );

      setSelectedOrder(updatedOrder);
      setModal("details");

      showNotice(
        "Order verified. Payment details are now available to the customer.",
      );
    } catch (err) {
      setError(err.message || "Failed to verify order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async (order) => {
    const confirmed = window.confirm(
      "Confirm that payment has been received for this order?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const updatedOrder = await confirmPayment(getOrderId(order));

      setOrders((current) =>
        current.map((item) =>
          getOrderId(item) === getOrderId(updatedOrder) ? updatedOrder : item,
        ),
      );

      setSelectedOrder(updatedOrder);

      showNotice("Payment confirmed successfully.");
    } catch (err) {
      setError(err.message || "Failed to confirm payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const openTracking = (order) => {
    setSelectedOrder(order);

    setTrackingForm({
      carrier: order?.tracking?.carrier || "",
      trackingNumber: order?.tracking?.trackingNumber || "",
      estimatedDelivery: order?.tracking?.estimatedDelivery
        ? new Date(order.tracking.estimatedDelivery).toISOString().split("T")[0]
        : "",
    });

    setModal("tracking");
  };

  const handleTrackingUpdate = async (event) => {
    event.preventDefault();

    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      setError("");

      const currentStatus = selectedOrder.status;

      let nextStatus = currentStatus;

      if (currentStatus === "paid") {
        nextStatus = "processing";
      }

      if (currentStatus === "processing") {
        nextStatus = "shipped";
      }

      if (currentStatus === "shipped") {
        nextStatus = "completed";
      }

      const updatedOrder = await updateOrderStatus(getOrderId(selectedOrder), {
        status: nextStatus,
        carrier: trackingForm.carrier,
        trackingNumber: trackingForm.trackingNumber,
        estimatedDelivery: trackingForm.estimatedDelivery
          ? new Date(trackingForm.estimatedDelivery).toISOString()
          : null,
      });

      setOrders((current) =>
        current.map((order) =>
          getOrderId(order) === getOrderId(updatedOrder) ? updatedOrder : order,
        ),
      );

      setSelectedOrder(updatedOrder);
      setModal("details");

      showNotice(`Order moved to ${STATUS_CONFIG[nextStatus]?.label}.`);
    } catch (err) {
      setError(err.message || "Failed to update order.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatus = (status) => {
    const config = STATUS_CONFIG[status] || {
      label: status,
      className: "",
    };

    return (
      <span className={`status-badge ${config.className}`}>{config.label}</span>
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Package size={21} />
          </div>

          <div>
            <strong>ProductHub</strong>
            <span>Order workspace</span>
          </div>
        </div>

        <button
          className="refresh-button"
          onClick={loadOrders}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">ORDER MANAGEMENT</p>

            <h1>Manage customer orders.</h1>

            <p className="hero-copy">
              Review submitted orders, verify payments, manage fulfillment and
              keep customers updated throughout delivery.
            </p>
          </div>

          <div className="hero-icon">
            <Package size={28} />
          </div>
        </section>

        <section className="stats-grid">
          <Stat
            label="Total orders"
            value={stats.total}
            hint="All customer orders"
          />

          <Stat
            label="Needs verification"
            value={stats.pending}
            hint="Waiting for admin review"
          />

          <Stat
            label="Payment submitted"
            value={stats.paymentSubmitted}
            hint="Needs payment confirmation"
          />

          <Stat
            label="Active orders"
            value={stats.paid}
            hint="Paid and being fulfilled"
          />

          <Stat
            label="Cancelled"
            value={stats.cancelled}
            hint="Cancelled orders"
          />
        </section>

        {notice && <div className="notice">{notice}</div>}

        {error && (
          <div className="error-box">
            <AlertCircle size={18} />

            <span>{error}</span>

            <button onClick={() => setError("")}>Dismiss</button>
          </div>
        )}

        <section className="toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, email or order ID..."
            />
          </div>

          <div className="toolbar-right">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>

              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>

            <button className="refresh-button" onClick={loadOrders}>
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </section>

        <div className="section-heading">
          <div>
            <h2>Orders</h2>
            <p>{filteredOrders.length} orders shown</p>
          </div>
        </div>

        {loading ? (
          <div className="orders-loading">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={25} />
            </div>

            <h3>
              {orders.length === 0 ? "No orders yet" : "No matching orders"}
            </h3>

            <p>
              {orders.length === 0
                ? "Customer orders will appear here when they submit checkout."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={getOrderId(order)}>
                    <td>
                      <strong>
                        #{getOrderId(order)?.slice(-8).toUpperCase()}
                      </strong>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <div className="avatar">
                          <User size={15} />
                        </div>

                        <div>
                          <strong>{getCustomerName(order)}</strong>

                          <span>{order?.userId?.email || "No email"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {order.items?.reduce(
                        (sum, item) => sum + Number(item.quantity || 0),
                        0,
                      ) || 0}
                    </td>

                    <td>
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                    </td>

                    <td>{renderStatus(order.status)}</td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      <button
                        className="table-action"
                        onClick={() => openOrder(order)}
                      >
                        View
                        <ChevronRight size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal === "details" && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={closeModal}
          onVerify={() => openVerify(selectedOrder)}
          onConfirmPayment={() => handleConfirmPayment(selectedOrder)}
          onTracking={() => openTracking(selectedOrder)}
          actionLoading={actionLoading}
        />
      )}

      {modal === "verify" && selectedOrder && (
        <Modal
          title="Verify order"
          subtitle="Add the bank account details the customer should use for payment."
          onClose={closeModal}
        >
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Bank name</label>

              <input
                required
                value={paymentForm.bankName}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    bankName: event.target.value,
                  }))
                }
                placeholder="e.g. Access Bank"
              />
            </div>

            <div className="form-group">
              <label>Account name</label>

              <input
                required
                value={paymentForm.accountName}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    accountName: event.target.value,
                  }))
                }
                placeholder="Account holder name"
              />
            </div>

            <div className="form-group">
              <label>Account number</label>

              <input
                required
                value={paymentForm.accountNumber}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    accountNumber: event.target.value,
                  }))
                }
                placeholder="10 digit account number"
              />
            </div>

            <div className="modal-info">
              <Clock size={17} />

              <span>
                Verification will give the customer 24 hours to make payment.
              </span>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="button secondary"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="button primary"
                disabled={actionLoading}
              >
                {actionLoading ? "Verifying..." : "Verify order"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "tracking" && selectedOrder && (
        <Modal
          title={
            selectedOrder.status === "paid"
              ? "Start processing"
              : selectedOrder.status === "processing"
                ? "Ship order"
                : "Complete order"
          }
          subtitle="Update the customer's order tracking information."
          onClose={closeModal}
        >
          <form onSubmit={handleTrackingUpdate}>
            <div className="form-group">
              <label>Carrier</label>

              <input
                value={trackingForm.carrier}
                onChange={(event) =>
                  setTrackingForm((current) => ({
                    ...current,
                    carrier: event.target.value,
                  }))
                }
                placeholder="e.g. DHL"
              />
            </div>

            <div className="form-group">
              <label>Tracking number</label>

              <input
                value={trackingForm.trackingNumber}
                onChange={(event) =>
                  setTrackingForm((current) => ({
                    ...current,
                    trackingNumber: event.target.value,
                  }))
                }
                placeholder="Tracking number"
              />
            </div>

            <div className="form-group">
              <label>Estimated delivery</label>

              <input
                type="date"
                value={trackingForm.estimatedDelivery}
                onChange={(event) =>
                  setTrackingForm((current) => ({
                    ...current,
                    estimatedDelivery: event.target.value,
                  }))
                }
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="button secondary"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="button primary"
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Update order"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function OrderDetails({
  order,
  onClose,
  onVerify,
  onConfirmPayment,
  onTracking,
  actionLoading,
}) {
  const status = STATUS_CONFIG[order.status] || {
    label: order.status,
  };

  const canVerify = order.status === "pending";

  const canConfirmPayment = order.status === "payment_submitted";

  const canUpdateTracking = ["paid", "processing", "shipped"].includes(
    order.status,
  );

  return (
    <div className="modal-backdrop">
      <div className="order-detail-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">ORDER DETAILS</p>

            <h2>#{getOrderId(order)?.slice(-8).toUpperCase()}</h2>

            <p>{formatDate(order.createdAt)}</p>
          </div>

          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <div className="order-detail-body">
          <div className="detail-top">
            <div>
              <span className="detail-label">Order status</span>

              <div className="detail-status">
                <span className={`status-badge ${status.className}`}>
                  {status.label}
                </span>
              </div>
            </div>

            <div className="detail-total">
              <span>Total</span>
              <strong>{formatCurrency(order.totalAmount)}</strong>
            </div>
          </div>

          <div className="detail-section">
            <h3>
              <User size={17} />
              Customer
            </h3>

            <div className="customer-detail">
              <strong>{getCustomerName(order)}</strong>

              <span>{order?.userId?.email || "No email available"}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>
              <Package size={17} />
              Items
            </h3>

            <div className="order-items">
              {order.items?.map((item, index) => (
                <div className="order-item" key={`${item.productId}-${index}`}>
                  <div>
                    <strong>{item.name}</strong>

                    <span>
                      {item.quantity} × {formatCurrency(item.price)}
                    </span>
                  </div>

                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </div>

          {order.payment && (
            <div className="detail-section">
              <h3>
                <Banknote size={17} />
                Payment
              </h3>

              <div className="payment-grid">
                <div>
                  <span>Bank</span>
                  <strong>{order.payment.bankName || "—"}</strong>
                </div>

                <div>
                  <span>Account name</span>
                  <strong>{order.payment.accountName || "—"}</strong>
                </div>

                <div>
                  <span>Account number</span>
                  <strong>{order.payment.accountNumber || "—"}</strong>
                </div>

                <div>
                  <span>Deadline</span>
                  <strong>{formatDate(order.payment.paymentDeadline)}</strong>
                </div>

                <div>
                  <span>Payment reference</span>
                  <strong>
                    {order.payment.paymentReference || "Not submitted"}
                  </strong>
                </div>

                <div>
                  <span>Paid at</span>
                  <strong>{formatDate(order.payment.paidAt)}</strong>
                </div>
              </div>
            </div>
          )}

          {order.tracking && (
            <div className="detail-section">
              <h3>
                <Truck size={17} />
                Tracking
              </h3>

              <div className="payment-grid">
                <div>
                  <span>Carrier</span>
                  <strong>{order.tracking.carrier || "Not assigned"}</strong>
                </div>

                <div>
                  <span>Tracking number</span>
                  <strong>
                    {order.tracking.trackingNumber || "Not assigned"}
                  </strong>
                </div>

                <div>
                  <span>Estimated delivery</span>
                  <strong>
                    {formatDate(order.tracking.estimatedDelivery)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div className="order-actions">
            {canVerify && (
              <button
                className="button primary"
                onClick={onVerify}
                disabled={actionLoading}
              >
                <Check size={17} />
                Verify order
              </button>
            )}

            {canConfirmPayment && (
              <button
                className="button primary"
                onClick={onConfirmPayment}
                disabled={actionLoading}
              >
                <Banknote size={17} />
                Confirm payment
              </button>
            )}

            {canUpdateTracking && (
              <button
                className="button primary"
                onClick={onTracking}
                disabled={actionLoading}
              >
                <Truck size={17} />

                {order.status === "paid"
                  ? "Start processing"
                  : order.status === "processing"
                    ? "Ship order"
                    : "Complete order"}
              </button>
            )}

            {order.status === "awaiting_payment" && (
              <div className="waiting-message">
                <Clock size={17} />
                Waiting for customer payment.
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="cancelled-message">
                <X size={17} />

                {order.cancellationReason || "This order has been cancelled."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
