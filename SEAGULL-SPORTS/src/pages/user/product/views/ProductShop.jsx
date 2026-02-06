import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import productController from "../controllers/productController";
import "./ProductShop.css";

const ProductShop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "Running",
    "Fitness",
    "Team Sports",
    "Swimming",
    "Cycling",
    "Yoga",
  ];

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let result;
      if (searchTerm.trim()) {
        result = await productController.searchProducts(searchTerm);
      } else {
        const filters = selectedCategory
          ? { category: selectedCategory, status: "active" }
          : { status: "active" };
        result = await productController.getProducts(filters);
      }

      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });

    // Show success message
    alert(`${product.name} added to cart!`);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="product-shop">
      {/* Header */}
      <div className="shop-header">
        <button className="back-btn" onClick={() => navigate("/user/home")}>
          ← Back to Home
        </button>
        <div className="header-content">
          <h1>Our Products</h1>
          <p>Discover premium sports equipment and gear</p>
        </div>
        <div className="cart-icon" onClick={() => navigate("/user/cart")}>
          <span className="cart-symbol">🛒</span>
          {getCartCount() > 0 && (
            <span className="cart-count">{getCartCount()}</span>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="shop-filters">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <button
            className={`filter-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Categories {selectedCategory && "• 1"}
          </button>

          {showFilters && (
            <div className="categories-panel">
              <button
                className={`category-btn ${!selectedCategory ? "active" : ""}`}
                onClick={() => handleCategoryFilter("")}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {selectedCategory && (
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-banner">{error}</div>}

      {/* Products Grid */}
      <div className="products-container">
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url || product.images[0]}
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <div className="product-placeholder">
                      <span>📷</span>
                      <p>No Image</p>
                    </div>
                  )}
                  {product.discountPrice > 0 && (
                    <span className="discount-badge">
                      {product.getDiscountPercentage()}% OFF
                    </span>
                  )}
                </div>

                <div className="product-details">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-brand">by {product.brand}</p>

                  {product.description && (
                    <p className="product-description">
                      {product.description.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description}
                    </p>
                  )}

                  <div className="product-pricing">
                    <span className="current-price">
                      {formatCurrency(product.getFinalPrice())}
                    </span>
                    {product.discountPrice > 0 && (
                      <span className="original-price">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>

                  <div className="product-stock">
                    {product.stockQuantity > 0 ? (
                      <span className="in-stock">
                        ✅ In Stock ({product.stockQuantity})
                      </span>
                    ) : (
                      <span className="out-of-stock">❌ Out of Stock</span>
                    )}
                  </div>

                  <div className="product-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                      disabled={product.stockQuantity === 0}
                    >
                      {product.stockQuantity === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/user/products/${product.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h3>No products found</h3>
            <p>
              {searchTerm || selectedCategory
                ? "Try adjusting your search or filters"
                : "No products are available at the moment"}
            </p>
            {(searchTerm || selectedCategory) && (
              <button className="clear-search-btn" onClick={clearFilters}>
                Clear Search & Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductShop;
