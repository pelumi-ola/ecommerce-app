import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";

export default function Cart() {
  const [cart, setCart] = useState({
    items: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    getCart();
  }, []);

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.patch(`/cart/${productId}`, {
        quantity,
      });

      await getCart();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update cart");
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);

      await getCart();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to remove item");
    }
  };

  const total = useMemo(() => {
    return (cart.items || []).reduce((sum, item) => {
      const product = item.productId;

      return sum + Number(product?.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  if (loading) {
    return (
      <main className="container section">
        <div className="loading">Loading cart...</div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="section-title">
        <div>
          <span className="eyebrow">YOUR CART</span>

          <h1>Shopping Cart</h1>
        </div>

        <Link to="/" className="btn secondary">
          Continue shopping
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      {cart.items?.length === 0 ? (
        <div className="empty">
          <h2>Your cart is empty</h2>

          <p>Add some products before checking out.</p>

          <Link to="/" className="btn">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => {
              const product = item.productId;

              return (
                <div className="cart-item" key={product._id}>
                  <img src={product.imageUrl} alt={product.name} />

                  <div className="cart-item-info">
                    <h3>{product.name}</h3>

                    <p>₦{Number(product.price).toLocaleString()}</p>

                    <div className="quantity">
                      <button
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(product._id, item.quantity - 1)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(product._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <strong>
                      ₦
                      {(Number(product.price) * item.quantity).toLocaleString()}
                    </strong>

                    <button
                      className="danger-link"
                      onClick={() => removeItem(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="summary">
            <h2>Summary</h2>

            <div className="summary-row">
              <span>Items</span>
              <span>{cart.items.length}</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>

              <strong>₦{total.toLocaleString()}</strong>
            </div>

            <Link to="/checkout" className="btn full">
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
