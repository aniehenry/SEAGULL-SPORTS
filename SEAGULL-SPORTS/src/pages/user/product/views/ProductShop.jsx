import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import useProductController from "../controllers/productController";
import "./ProductShop.css";

const ProductShop = () => {
  const navigate = useNavigate();
  const { user, logout, userRole } = useAuth();
  const {
    products,
    loading,
    error,
    searchTerm,
    selectedCategory,
    categories,
    handleSearch,
    handleCategoryFilter,
    handleAddToCart,
  } = useProductController();

  const [notification, setNotification] = useState(null);

  // Redirect admin users
  useEffect(() => {
    if (userRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [userRole, navigate]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const onAddToCart = async (product) => {
    const result = await handleAddToCart(product, 1);
    if (result.success) {
      showNotification(result.message, "success");
    } else {
      showNotification(result.message, "error");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="product-shop">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-shop">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <div className="shop-content">
        <div className="shop-header">
          <h1>Our Products</h1>
          <p>Discover premium sports equipment and gear</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="shop-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <div key={`${product.adminId}-${product.id}`} className="product-card">
                <div className="product-image">
                  <img
                    src={product.getMainImage()}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                  {!product.isInStock() && (
                    <div className="out-of-stock-overlay">
                      <span>Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-pricing">
                    <span className="current-price">{formatPrice(product.sellingPrice)}</span>
                    {product.purchasePrice && (
                      <span className="original-price">{formatPrice(product.purchasePrice)}</span>
                    )}
                  </div>
                  
                  <div className="product-stock">
                    <span className={`stock-status ${product.isInStock() ? 'in-stock' : 'out-of-stock'}`}>
                      {product.isInStock() ? `In Stock (${product.stockQuantity})` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <button
                    className={`add-to-cart-btn ${!product.isInStock() ? 'disabled' : ''}`}
                    onClick={() => onAddToCart(product)}
                    disabled={!product.isInStock()}
                  >
                    {product.isInStock() ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products">
            <div className="no-products-content">
              <span className="no-products-icon">📦</span>
              <h3>No Products Found</h3>
              <p>We couldn't find any products matching your criteria.</p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    handleSearch('');
                    handleCategoryFilter('all');
                  }}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductShop;
