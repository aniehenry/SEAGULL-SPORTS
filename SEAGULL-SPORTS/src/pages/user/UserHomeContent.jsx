import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserHome.css";

const UserHomeContent = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

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
      description: "Swimming and water sports gear",
    },
    {
      icon: "🚴",
      title: "Cycling",
      description: "Bikes and cycling accessories",
    },
    {
      icon: "🧘",
      title: "Yoga",
      description: "Yoga and meditation equipment",
    },
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="user-home">
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
                <button 
                  className="hero-cta"
                  onClick={() => navigate("/user/products")}
                >
                  Shop Now
                </button>
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
                <button 
                  className="category-btn"
                  onClick={() => navigate("/user/products")}
                >
                  Browse
                </button>
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

export default UserHomeContent;