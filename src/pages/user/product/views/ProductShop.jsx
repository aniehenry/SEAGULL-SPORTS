import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import useProductController from "../controllers/productController";
import "./ProductShop.css";

const ProductShop = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const {
    products,
    loading,
    searchTerm,
    selectedCategory,
    categories,
    handleSearch,
    handleCategoryFilter,
    handleAddToCart,
  } = useProductController();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (userRole === "admin") navigate("/admin/dashboard", { replace: true });
  }, [userRole, navigate]);

  const onAddToCart = async (product) => {
    const result = await handleAddToCart(product, 1);
    setNotification({
      message: result.message,
      type: result.success ? "success" : "error",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p);

  if (loading) return <div className="shop-loading">Gathering Gear...</div>;

  return (
    <div className="shop-layout-wrapper">
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* --- SIDEBAR CATEGORIES --- */}
      <aside className="shop-sidebar">
        <div className="sidebar-brand">SEAGULL</div>
        <div className="category-vertical-list">
          <button
            className={`cat-item-link ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => handleCategoryFilter("all")}
          >
            All Collections
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-item-link ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => handleCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="shop-main-content">
        <header className="shop-top-bar">
          <div className="search-box-compact">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </header>

        {/* --- PRODUCT DETAIL VIEW --- */}
        {selectedProduct && (
          <div className="compact-detail-overlay">
            <div className="detail-card-inner">
              <button
                className="close-detail"
                onClick={() => setSelectedProduct(null)}
              >
                ✕
              </button>
              <div className="detail-grid-compact">
                <div className="detail-img-box">
                  <img
                    src={selectedProduct.getMainImage()}
                    alt={selectedProduct.name}
                  />
                </div>
                <div className="detail-info-box">
                  <span className="mini-badge">{selectedProduct.category}</span>
                  <h2>{selectedProduct.name}</h2>
                  <p className="compact-desc">{selectedProduct.description}</p>
                  <div className="price-row">
                    <span className="price-amt">
                      {formatPrice(selectedProduct.sellingPrice)}
                    </span>
                    <span
                      className={`stock-status ${selectedProduct.stockQuantity > 0 ? "in" : "out"}`}
                    >
                      {selectedProduct.stockQuantity > 0
                        ? `${selectedProduct.stockQuantity} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                  <button
                    className="buy-btn-compact"
                    disabled={selectedProduct.stockQuantity <= 0}
                    onClick={() => onAddToCart(selectedProduct)}
                  >
                    {selectedProduct.stockQuantity > 0
                      ? "Add to Bag"
                      : "Sold Out"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- DENSE PRODUCT GRID --- */}
        <div className="dense-grid">
          {products
            .filter((p) =>
              selectedProduct ? p.id !== selectedProduct.id : true,
            )
            .map((product) => (
              <div
                key={product.id}
                className="compact-product-card"
                onClick={() => {
                  setSelectedProduct(product);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <div className="compact-img-wrapper">
                  <img src={product.getMainImage()} alt={product.name} />
                </div>
                <div className="compact-meta">
                  <span className="compact-cat-label">{product.category}</span>
                  <h4 className="compact-name">{product.name}</h4>
                  <div className="compact-footer">
                    <span className="compact-price">
                      {formatPrice(product.sellingPrice)}
                    </span>
                    <span className="compact-stock">
                      {product.stockQuantity} left
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default ProductShop;
