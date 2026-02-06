import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebasecongif";
import { useAuth } from "../../contexts/AuthContext";
import "./SignIn.css";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  // Effect to handle navigation after successful authentication
  useEffect(() => {
    if (user && !loading && userRole !== null) {
      console.log("=== NAVIGATION LOGIC ===");
      console.log("User authenticated:", user.email);
      console.log("User UID:", user.uid);
      console.log("User role from context:", userRole);
      console.log("User role type:", typeof userRole);
      console.log("Role === 'admin':", userRole === "admin");
      console.log("Role === 'user':", userRole === "user");
      console.log("Loading state:", loading);
      
      // Navigate based on role
      if (userRole === "admin") {
        console.log("🔐 ADMIN DETECTED - Navigating to dashboard");
        navigate("/admin/dashboard?redirect=signin");
      } else {
        console.log("👤 USER DETECTED - Navigating to home");
        navigate("/user/home?redirect=signin");
      }
      
      // Reset loading state after navigation
      setIsLoading(false);
    }
  }, [user, userRole, loading, navigate]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters long";
    return "";
  };

  // Real-time validation
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    const newErrors = {
      email: emailError,
      password: passwordError,
    };

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    return !emailError && !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Firebase Authentication - let AuthContext handle role fetching and navigation
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const user = userCredential.user;
      console.log("✅ User signed in successfully:", user.email);
      console.log("🔄 AuthContext will handle role fetching and navigation...");
      
      // The useEffect above will handle navigation once AuthContext updates
      
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      let errorMessage = "Invalid email or password. Please try again.";

      // Handle specific Firebase auth errors
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
        default:
          errorMessage = "Sign in failed. Please try again.";
      }

      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left-panel">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">
                Sign in to your SEAGULL-SPORTS account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {errors.general && (
                <div className="error-message general-error">
                  {errors.general}
                </div>
              )}

              <div
                className={`form-group ${errors.email && touched.email ? "has-error" : ""}`}
              >
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email && touched.email ? "error" : ""}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  placeholder="Enter your email"
                />
                {errors.email && touched.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div
                className={`form-group ${errors.password && touched.password ? "has-error" : ""}`}
              >
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className={`form-input ${errors.password && touched.password ? "error" : ""}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  placeholder="Enter your password"
                />
                {errors.password && touched.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <button
                type="submit"
                className={`auth-submit-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner">Signing In...</span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="auth-switch-link">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right-panel">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <div className="content-panel">
          <h2 className="brand-logo">SEAGULL-SPORTS</h2>
          <p className="brand-tagline">
            Your premier destination for quality sports equipment and gear
          </p>

          <ul className="feature-list">
            <li className="feature-item">
              <span className="feature-icon">🏏</span>
              <span>Professional Cricket Equipment</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Lightning Fast Delivery</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>Premium Quality Assurance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
