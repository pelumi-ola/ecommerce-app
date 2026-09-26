import { useEffect, useState } from "react";

import api from "../api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/product");

      setProducts(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <span>WELCOME TO MYSTORE</span>

          <h1>
            Find something
            <br />
            you love.
          </h1>

          <p>Browse our products and add your favorites to your cart.</p>
        </div>
      </section>

      <section className="container section">
        <div className="section-title">
          <div>
            <span className="eyebrow">OUR STORE</span>

            <h2>Products</h2>
          </div>
        </div>

        {loading && <div className="loading">Loading products...</div>}

        {error && <div className="error">{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div className="empty">No products available.</div>
        )}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
