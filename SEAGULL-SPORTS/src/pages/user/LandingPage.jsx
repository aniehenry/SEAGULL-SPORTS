import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            PANDA
            <span className="hero-subtitle">Business Management</span>
          </h1>
          <p className="hero-description">
            Complete business management solution for retail and wholesale
            operations. Manage inventory, sales, purchases, and payments all in
            one place.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleGetStarted}>
              Get Started
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-heading">
            Everything You Need to Manage Your Business
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Inventory Management</h3>
              <p>
                Track your products, stock levels, and manage items effortlessly
                with real-time updates.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Sales & Invoicing</h3>
              <p>
                Create professional invoices, track sales, and manage customer
                transactions seamlessly.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛒</div>
              <h3>Purchase Orders</h3>
              <p>
                Manage suppliers, create purchase orders, and keep track of
                incoming inventory.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Payment Tracking</h3>
              <p>
                Monitor payments in and out, track dues, and maintain clear
                financial records.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Party Management</h3>
              <p>
                Maintain detailed records of customers and suppliers with
                complete transaction history.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Analytics Dashboard</h3>
              <p>
                Get insights into your business performance with comprehensive
                reports and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>500+</h3>
              <p>Active Businesses</p>
            </div>
            <div className="stat-item">
              <h3>10K+</h3>
              <p>Invoices Generated</p>
            </div>
            <div className="stat-item">
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Business?</h2>
          <p>
            Join hundreds of businesses already using PANDA to streamline their
            operations.
          </p>
          <button className="btn-cta" onClick={() => navigate("/signup")}>
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2026 PANDA Business Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
