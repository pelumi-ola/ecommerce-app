import { Edit3, Trash2, PackageCheck, PackageX } from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="image-fallback">
            <span>NO IMAGE</span>
          </div>
        )}

        <span
          className={`stock-badge ${
            product.inStock ? "available" : "unavailable"
          }`}
        >
          {product.inStock ? (
            <PackageCheck size={14} />
          ) : (
            <PackageX size={14} />
          )}

          {product.inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      <div className="product-content">
        <div className="product-meta">
          <span className="category">
            {product.category || "Uncategorized"}
          </span>
        </div>

        <h3>{product.name}</h3>

        <p className="product-price">{formatPrice(product.price)}</p>

        <div className="card-actions">
          <button
            className="action-button edit"
            onClick={() => onEdit(product)}
          >
            <Edit3 size={16} />
            Edit
          </button>

          <button
            className="action-button delete"
            onClick={() => onDelete(product)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
