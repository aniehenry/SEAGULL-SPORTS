import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebasecongif";
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name.trim()) return `${fieldName} is required`;
    if (name.trim().length < 2)
      return `${fieldName} must be at least 2 characters long`;
    if (!/^[a-zA-Z\s]+$/.test(name))
      return `${fieldName} should only contain letters and spaces`;
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password))
      return "Password must contain at least one number";
    if (!/(?=.*[@$!%*?&])/.test(password))
      return "Password must contain at least one special character (@$!%*?&)";
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  // Real-time validation
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
        error = validateName(value, "First name");
        break;
      case "lastName":
        error = validateName(value, "Last name");
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        // Also validate confirm password if it exists
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(
            value,
            formData.confirmPassword,
          );
          setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case "confirmPassword":
        error = validateConfirmPassword(formData.password, value);
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
    const firstNameError = validateName(formData.firstName, "First name");
    const lastNameError = validateName(formData.lastName, "Last name");
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword,
    );

    const newErrors = {
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    };

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return (
      !firstNameError &&
      !lastNameError &&
      !emailError &&
      !passwordError &&
      !confirmPasswordError
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Firebase Authentication - Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const user = userCredential.user;
      console.log("User created:", user);

      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      console.log("User profile updated with name:", user.displayName);

      // Determine user role based on email or create admin accounts
      const adminEmails = [
        "admin@seagullsports.com",
        "manager@seagullsports.com",
        "owner@seagullsports.com",
      ];

      const userRole = adminEmails.includes(formData.email.toLowerCase())
        ? "admin"
        : "user";

      // Save user data to Firestore database
      const userData = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
        role: userRole, // Assign role based on email
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      console.log("User data saved to Firestore:", userData);

      // Redirect based on user role
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/home");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      let errorMessage = "Registration failed. Please try again.";

      // Handle specific Firebase auth errors
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;
        case "auth/weak-password":
          errorMessage =
            "Password is too weak. Please choose a stronger password.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
        case "permission-denied":
          errorMessage = "Database error. Please try again.";
          break;
        default:
          errorMessage = "Registration failed. Please try again.";
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
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">
                Join SEAGULL-SPORTS community today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {errors.general && (
                <div className="error-message general-error">
                  {errors.general}
                </div>
              )}

              <div className="form-row">
                <div
                  className={`form-group ${errors.firstName && touched.firstName ? "has-error" : ""}`}
                >
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className={`form-input ${errors.firstName && touched.firstName ? "error" : ""}`}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    required
                    placeholder="First name"
                  />
                  {errors.firstName && touched.firstName && (
                    <span className="error-message">{errors.firstName}</span>
                  )}
                </div>
                <div
                  className={`form-group ${errors.lastName && touched.lastName ? "has-error" : ""}`}
                >
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className={`form-input ${errors.lastName && touched.lastName ? "error" : ""}`}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    required
                    placeholder="Last name"
                  />
                  {errors.lastName && touched.lastName && (
                    <span className="error-message">{errors.lastName}</span>
                  )}
                </div>
              </div>

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
                  placeholder="Create a password"
                />
                {errors.password && touched.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div
                className={`form-group ${errors.confirmPassword && touched.confirmPassword ? "has-error" : ""}`}
              >
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword && touched.confirmPassword ? "error" : ""}`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`auth-submit-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner">Creating Account...</span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <Link to="/signin" className="auth-switch-link">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right-panel">
        <div className="content-panel">
          <h2 className="brand-logo">SEAGULL-SPORTS</h2>
          <p className="brand-tagline">
            Start your journey with premium sports equipment
          </p>

          <ul className="feature-list">
            <li className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Precision Equipment</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">💪</span>
              <span>Built for Champions</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">🌟</span>
              <span>Excellence Delivered</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
