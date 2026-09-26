import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  RefreshCw,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";

import ProductForm from "../components/ProductForm";
import ProductCard from "../components/ProductCard";
import StatCard from "../components/StatCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const inStock = products.filter((product) => product.inStock).length;

  const outOfStock = products.length - inStock;

  const openCreate = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      setError("");

      if (selectedProduct) {
        const id = selectedProduct._id || selectedProduct.id;

        await updateProduct(id, formData);

        setNotice("Product updated successfully.");
      } else {
        await createProduct(formData);

        setNotice("Product created successfully.");
      }

      setShowForm(false);
      setSelectedProduct(null);

      await loadProducts();

      setTimeout(() => {
        setNotice("");
      }, 2500);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const id = product._id || product.id;

    const confirmed = window.confirm(`Delete "${product.name}"?`);

    if (!confirmed) return;

    try {
      await deleteProduct(id);

      setProducts((current) =>
        current.filter((item) => (item._id || item.id) !== id),
      );

      setNotice("Product deleted successfully.");

      setTimeout(() => {
        setNotice("");
      }, 2500);
    } catch (error) {
      setError(error.message);
    }
  };

  const { isAuthenticated, user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      {/* HEADER */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Package size={21} />
          </div>

          <div>
            <strong>ProductHub</strong>
            <span>Inventory workspace</span>
          </div>
        </div>

        <button className="button primary" onClick={openCreate}>
          <Plus size={18} />
          Add product
        </button>

        <button className="nav-button" onClick={() => navigate("/orders")}>
          <Package size={17} />
          Orders
        </button>

        <button className="btn secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="container">
        {/* HERO */}
        <section className="hero">
          <div>
            <p className="eyebrow">PRODUCT MANAGEMENT</p>

            <h1>Manage your products.</h1>

            <p className="hero-copy">
              Keep your catalogue organized, updated and ready for your
              customers.
            </p>
          </div>

          <div className="hero-icon">
            <LayoutGrid size={28} />
          </div>
        </section>

        {/* STATS */}
        <section className="stats-grid">
          <StatCard
            label="Total products"
            value={products.length}
            hint="Across your catalogue"
          />

          <StatCard
            label="In stock"
            value={inStock}
            hint="Currently available"
          />

          <StatCard
            label="Out of stock"
            value={outOfStock}
            hint="Need attention"
          />
        </section>

        {/* SUCCESS */}
        {notice && <div className="notice">{notice}</div>}

        {/* ERROR */}
        {error && (
          <div className="error-box">
            <AlertCircle size={18} />

            <span>{error}</span>

            <button onClick={() => setError("")}>Dismiss</button>
          </div>
        )}

        {/* SEARCH */}
        <section className="toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or categories..."
            />
          </div>

          <div className="toolbar-right">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button className="refresh-button" onClick={loadProducts}>
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </section>

        {/* PRODUCTS */}
        <div className="section-heading">
          <div>
            <h2>Products</h2>

            <p>{filteredProducts.length} products shown</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={25} />
            </div>

            <h3>
              {products.length === 0
                ? "No products yet"
                : "No matching products"}
            </h3>

            <p>
              {products.length === 0
                ? "Add your first product to start building your catalogue."
                : "Try changing your search or category filter."}
            </p>

            {products.length === 0 && (
              <button className="button primary" onClick={openCreate}>
                <Plus size={17} />
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ProductForm
          product={selectedProduct}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
          loading={saving}
        />
      )}
    </div>
  );
}
