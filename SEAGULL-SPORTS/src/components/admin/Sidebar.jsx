import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const goToUserHome = () => {
    navigate("/user/home");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">PANDA</h2>
        <p className="sidebar-subtitle">Business Management</p>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </NavLink>

        {/* Party */}
        <NavLink
          to="/admin/parties"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">👥</span>
          <span className="nav-text">Party</span>
        </NavLink>

        {/* Item */}
        <NavLink
          to="/admin/items"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">📦</span>
          <span className="nav-text">Item</span>
        </NavLink>

        {/* Invoice */}
        <NavLink
          to="/admin/invoices"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">📄</span>
          <span className="nav-text">Invoice</span>
        </NavLink>

        {/* Purchase */}
        <NavLink
          to="/admin/purchases"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Purchase</span>
        </NavLink>

        {/* Payment */}
        <NavLink
          to="/admin/payments"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">💰</span>
          <span className="nav-text">Payment</span>
        </NavLink>

        {/* Order */}
        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">📋</span>
          <span className="nav-text">Order</span>
        </NavLink>
      </nav>

      {/* Logout at bottom */}
      <div className="sidebar-footer">
        <button className="nav-item home-btn" onClick={goToUserHome}>
          <span className="nav-icon">🏪</span>
          <span className="nav-text">User Shop</span>
        </button>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
