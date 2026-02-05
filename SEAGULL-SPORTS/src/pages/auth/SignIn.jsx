import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebasecongif";
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
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const user = userCredential.user;
      console.log("User signed in:", user);

      // Check if user has admin role (you can customize this based on your user data structure)
      // For now, we'll allow all authenticated users to access admin dashboard
      // In a real app, you'd check user roles from Firestore or custom claims
      const userRole = "admin"; // This should come from your user's custom claims or Firestore

      if (userRole !== "admin") {
        setErrors((prev) => ({
          ...prev,
          general: "Access denied. Admin role required.",
        }));
        return;
      }

      // Redirect to admin dashboard after successful login
      navigate("/admin/dashboard");
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
    } finally {
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
