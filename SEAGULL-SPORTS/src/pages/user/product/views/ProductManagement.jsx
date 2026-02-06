import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import productController from "../controllers/productController";
import "./ProductManagement.css";

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    brand: "",
  });
  const [stats, setStats] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let result;
      if (searchTerm.trim()) {
        result = await productController.searchProducts(searchTerm);
      } else {
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== ""),
        );
        result = await productController.getProducts(activeFilters);
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
  }, [searchTerm, filters]);

  const loadStats = useCallback(async () => {
    try {
      const result = await productController.getProductStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, [loadProducts, loadStats]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Debounce search
    setTimeout(() => {
      if (e.target.value === searchTerm) {
        loadProducts();
      }
    }, 500);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      status: "",
      brand: "",
    });
    setSearchTerm("");
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedProducts.length === 0) {
      alert("Please select products first");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to update ${selectedProducts.length} products to ${newStatus}?`,
      )
    ) {
      try {
        const result = await productController.bulkUpdateStatus(
          selectedProducts,
          newStatus,
        );
        if (result.success) {
          alert(result.message);
          setSelectedProducts([]);
          loadProducts();
          loadStats();
        } else {
          alert(result.error);
        }
      } catch (err) {
        alert("Failed to update products");
        console.error("Error updating products:", err);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const result = await productController.deleteProduct(productId);
        if (result.success) {
          alert("Product deleted successfully");
          loadProducts();
          loadStats();
        } else {
          alert(result.error);
        }
      } catch (err) {
        alert("Failed to delete product");
        console.error("Error deleting product:", err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: { backgroundColor: "#10b981", color: "white" },
      inactive: { backgroundColor: "#6b7280", color: "white" },
      out_of_stock: { backgroundColor: "#ef4444", color: "white" },
    };

    return (
      <span
        className="status-badge"
        style={statusStyles[status] || statusStyles.inactive}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const getStockStatusBadge = (product) => {
    if (product.stockQuantity === 0) {
      return <span className="stock-badge out-of-stock">Out of Stock</span>;
    } else if (product.stockQuantity <= 10) {
      return <span className="stock-badge low-stock">Low Stock</span>;
    } else {
      return <span className="stock-badge in-stock">In Stock</span>;
    }
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
    <div className="product-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <div className="header-right">
          <button
            className="btn-primary"
            onClick={() => navigate("/user/products/add")}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.outOfStock}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(stats.totalValue)}</div>
            <div className="stat-label">Total Inventory Value</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-bar">
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
            Filters{" "}
            {Object.values(filters).some((v) => v) && (
              <span className="filter-count">•</span>
            )}
          </button>

          {showFilters && (
            <div className="filters-panel">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Running">Running</option>
                <option value="Fitness">Fitness</option>
                <option value="Team Sports">Team Sports</option>
                <option value="Swimming">Swimming</option>
                <option value="Cycling">Cycling</option>
                <option value="Yoga">Yoga</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              <input
                type="text"
                placeholder="Brand"
                value={filters.brand}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
              />

              <button className="btn-secondary" onClick={clearFilters}>
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedProducts.length} products selected</span>
          <div className="bulk-buttons">
            <button
              className="btn-outline"
              onClick={() => handleBulkStatusUpdate("active")}
            >
              Mark Active
            </button>
            <button
              className="btn-outline"
              onClick={() => handleBulkStatusUpdate("inactive")}
            >
              Mark Inactive
            </button>
            <button
              className="btn-outline"
              onClick={() => setSelectedProducts([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="error-banner">{error}</div>}

      {/* Products Table */}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.length === products.length &&
                    products.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </td>
                <td>
                  <div className="product-cell">
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="image-placeholder">📷</div>
                      )}
                    </div>
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-description">
                        {product.description?.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <div className="price-cell">
                    <div className="current-price">
                      {formatCurrency(product.getFinalPrice())}
                    </div>
                    {product.discountPrice > 0 && (
                      <div className="original-price">
                        {formatCurrency(product.price)}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="stock-cell">
                    <div className="stock-quantity">
                      {product.stockQuantity}
                    </div>
                    {getStockStatusBadge(product)}
                  </div>
                </td>
                <td>{getStatusBadge(product.status)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon"
                      onClick={() =>
                        navigate(`/user/products/edit/${product.id}`)
                      }
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDeleteProduct(product.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products found</h3>
            <p>Get started by adding your first product</p>
            <button
              className="btn-primary"
              onClick={() => navigate("/user/products/add")}
            >
              Add Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
