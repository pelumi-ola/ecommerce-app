import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api";

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    items: [],
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const getCart = async () => {
      try {
        const response = await api.get("/cart");

        setCart(response.data.data || response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    getCart();
  }, []);

  const total = useMemo(() => {
    return (cart.items || []).reduce((sum, item) => {
      return sum + Number(item.productId?.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  const submitOrder = async () => {
    try {
      setSubmitting(true);
      setError("");

      // No body required.
      const response = await api.post("/checkout");

      const order = response.data.data || response.data;

      navigate(`/orders/${order._id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container section">
        <div className="loading">Preparing checkout...</div>
      </main>
    );
  }

  if (!cart.items?.length) {
    return (
      <main className="container section">
        <div className="empty">
          <h1>Your cart is empty</h1>

          <Link to="/" className="btn">
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container narrow section">
      <span className="eyebrow">FINAL STEP</span>

      <h1>Checkout</h1>

      <p className="muted">Review your items and submit your order.</p>

      {error && <div className="error">{error}</div>}

      <div className="checkout-card">
        <h2>Your order</h2>

        {cart.items.map((item) => {
          const product = item.productId;

          return (
            <div className="checkout-item" key={product._id}>
              <div>
                <strong>{product.name}</strong>

                <p>
                  ₦{Number(product.price).toLocaleString()} × {item.quantity}
                </p>
              </div>

              <strong>
                ₦{(Number(product.price) * item.quantity).toLocaleString()}
              </strong>
            </div>
          );
        })}

        <hr />

        <div className="checkout-total">
          <span>Total</span>

          <strong>₦{total.toLocaleString()}</strong>
        </div>

        <button
          className="btn full"
          onClick={submitOrder}
          disabled={submitting}
        >
          {submitting ? "Submitting order..." : "Submit order"}
        </button>

        <p className="checkout-note">
          Payment will be handled later. For now, submitting this form creates
          your order.
        </p>
      </div>
    </main>
  );
}
