import { useEffect, useState } from "react";
import { X, ImagePlus, Save } from "lucide-react";

const emptyForm = {
  name: "",
  price: "",
  category: "",
  inStock: true,
  imageUrl: "",
};

export default function ProductForm({ product, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        price: product.price || "",
        category: product.category || "",
        inStock: Boolean(product.inStock),
        details: product.details || "",
        imageUrl: product.imageUrl || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      ...form,
      price: Number(form.price),
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {product ? "EDIT PRODUCT" : "NEW PRODUCT"}
            </p>

            <h2>{product ? "Update product" : "Add a product"}</h2>
          </div>

          <button className="icon-button" onClick={onCancel}>
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <label>
            Product name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              Product price
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="50000"
                required
              />
            </label>

            <label>
              Category
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Electronics"
                required
              />
            </label>

            <label>
              Details
              <textarea
                name="details"
                value={form.details}
                cols={40}
                rows={10}
                style={{ marginTop: "10px" }}
                onChange={handleChange}
                placeholder="Electronics for house appliances"
                required
              />
            </label>
          </div>

          <label>
            Image URL
            <div className="input-with-icon">
              <ImagePlus size={18} />

              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </label>

          <label className="stock-toggle">
            <input
              type="checkbox"
              name="inStock"
              checked={form.inStock}
              onChange={handleChange}
            />

            <span className="toggle-ui" />

            <span>
              <strong>In stock</strong>
              <small>Product is currently available.</small>
            </span>
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button type="submit" className="button primary" disabled={loading}>
              <Save size={17} />

              {loading
                ? "Saving..."
                : product
                  ? "Save changes"
                  : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
