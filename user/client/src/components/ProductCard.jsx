import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";
import { useAuth } from "../context/useAuth";

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await api.post("/cart", {
        productId: product._id,
        quantity,
      });

      setMessage("Added to cart ✓");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />

      <div className="product-info">
        <span className="category">{product.category || "Product"}</span>

        <h3>{product.name}</h3>

        <p>{product.details || "No description"}</p>

        <div className="product-price">
          ₦{Number(product.price).toLocaleString()}
        </div>

        <div className="stock">
          {product.inStock ? "In stock" : "Out of stock"}
        </div>

        {product.inStock && (
          <div className="add-cart">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value) || 1))
              }
            />

            <button className="btn" onClick={addToCart} disabled={loading}>
              {loading ? "Adding..." : "Add to cart"}
            </button>
          </div>
        )}

        {message && <small className="message">{message}</small>}
      </div>
    </div>
  );
}
