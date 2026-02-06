import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./UserLayout.css";

const UserLayout = () => {
  const navigate = useNavigate();
  const { user, logout, userRole } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Redirect admin users who accidentally land on user pages
  useEffect(() => {
    if (userRole === "admin") {
      console.log("Admin user detected on user page, redirecting to admin dashboard");
      navigate("/admin/dashboard", { replace: true });
    }
  }, [userRole, navigate]);

  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = localStorage.getItem("seagull-cart");
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          const count = cart.reduce((total, item) => total + item.quantity, 0);
          setCartItemCount(count);
        } else {
          // If no cart data found, set count to 0
          setCartItemCount(0);
        }
      } catch (err) {
        console.error("Error loading cart count:", err);
        setCartItemCount(0);
      }
    };

    updateCartCount();
    
    // Listen for storage changes (cart updates from other components)
    const handleStorageChange = (e) => {
      if (e.key === "seagull-cart" || e.key === null) {
        updateCartCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', updateCartCount);
    
    // Listen for focus events to update cart count when user returns to tab
    window.addEventListener('focus', updateCartCount);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('focus', updateCartCount);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="shopping-website">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>SEAGULL-SPORTS</h1>
          </div>

          <div className="nav-menu">
            <a href="#home" onClick={(e) => {
              e.preventDefault();
              navigate("/user/home");
            }}>Home</a>
            <div className="nav-dropdown">
              <a href="#categories" className="dropdown-toggle">
                Categories
              </a>
              <div className="categories-dropdown">
                <a href="#running">🏃 Running</a>
                <a href="#fitness">🏋️ Fitness</a>
                <a href="#team-sports">⚽ Team Sports</a>
                <a href="#swimming">🏊 Swimming</a>
                <a href="#cycling">🚴 Cycling</a>
                <a href="#yoga">🧘 Yoga</a>
              </div>
            </div>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                navigate("/user/products");
              }}
            >
              Products
            </a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="nav-cart">
            <button
              className="cart-btn"
              onClick={() => navigate("/user/cart")}
            >
              <span className="cart-icon">🛒</span>
              {cartItemCount > 0 && (
                <span className="cart-counter">{cartItemCount}</span>
              )}
            </button>
          </div>

          <div className="nav-profile">
            <button
              className="profile-btn"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <span className="profile-icon">👤</span>
            </button>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <span className="user-avatar">👤</span>
                  <div className="user-details">
                    <p className="user-name">{user?.displayName || "User"}</p>
                    <p className="user-email">{user?.email}</p>
                  </div>
                </div>
                <hr />
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/user/products")}
                >
                  <span>🛍️</span> Shop Products
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/user/cart")}
                >
                  <span>🛒</span> View Cart {cartItemCount > 0 && `(${cartItemCount})`}
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/user/orders")}
                >
                  <span>📦</span> My Orders
                </button>
                {userRole === "admin" && (
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/admin/dashboard")}
                  >
                    <span>⚙️</span> Admin Dashboard
                  </button>
                )}
                <button className="dropdown-item" onClick={handleLogout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="page-content">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;