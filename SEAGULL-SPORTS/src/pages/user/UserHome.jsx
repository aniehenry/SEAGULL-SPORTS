import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./UserHome.css";

const UserHome = () => {
  const navigate = useNavigate();
  const { user, logout, userRole } = useAuth();

  // Redirect admin users who accidentally land on user home
  useEffect(() => {
    if (userRole === "admin") {
      console.log(
        "Admin user detected on user page, redirecting to admin dashboard",
      );
      navigate("/admin/dashboard", { replace: true });
    }
  }, [userRole, navigate]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Premium Sports Equipment",
      subtitle: "Gear up for excellence",
    },
    {
      url: "https://images.unsplash.com/photo-1594736797933-d0c5ac80ba5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Professional Training Gear",
      subtitle: "Train like a champion",
    },
    {
      url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Fitness & Wellness",
      subtitle: "Your journey starts here",
    },
  ];

  const categories = [
    {
      icon: "🏃",
      title: "Running",
      description: "Premium running gear and accessories",
    },
    {
      icon: "🏋️",
      title: "Fitness",
      description: "Strength training equipment",
    },
    {
      icon: "⚽",
      title: "Team Sports",
      description: "Equipment for all team sports",
    },
    {
      icon: "🏊",
      title: "Swimming",
      description: "Swimwear and pool accessories",
    },
    {
      icon: "🚴",
      title: "Cycling",
      description: "Bikes and cycling gear",
    },
    {
      icon: "🧘",
      title: "Yoga",
      description: "Mindful movement essentials",
    },
  ];

  // Auto-scroll hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="shopping-website">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>SEAGULL-SPORTS</h1>
          </div>

          <div className="nav-menu">
            <a href="#home">Home</a>
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

      {/* Hero Section with Auto-scrolling Images */}
      <section className="hero-section" id="home">
        <div className="hero-carousel">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${image.url})`,
              }}
            >
              <div className="hero-content">
                <h1>{image.title}</h1>
                <p>{image.subtitle}</p>
                <button className="hero-cta">Shop Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="container">
          <h2>Welcome to SEAGULL-SPORTS</h2>
          <p>
            Your premier destination for high-quality sports equipment and gear.
            We offer everything you need to excel in your athletic journey.
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section" id="categories">
        <div className="container">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <button className="category-btn">Browse</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🚚</span>
              <h3>Free Shipping</h3>
              <p>Free delivery on orders over $50</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔄</span>
              <h3>Easy Returns</h3>
              <p>30-day hassle-free returns</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h3>Quality Guarantee</h3>
              <p>Premium sports equipment</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📞</span>
              <h3>24/7 Support</h3>
              <p>Expert customer service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>SEAGULL-SPORTS</h3>
              <p>Your trusted partner in sports excellence</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="#home">Home</a>
              <a href="#categories">Categories</a>
              <a href="#products">Products</a>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <a href="#contact">Contact Us</a>
              <a href="#faq">FAQ</a>
              <a href="#returns">Returns</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 SEAGULL-SPORTS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserHome;
