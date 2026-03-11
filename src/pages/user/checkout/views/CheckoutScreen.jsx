import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import useOrderController from "../../order/controllers/orderController";
import Order from "../../order/models/Order";
import "./CheckoutScreen.css";

// --- SUB-COMPONENTS (Defined OUTSIDE to fix the typing/focus bug) ---

const ProgressIndicator = ({ currentStage }) => (
  <div className="progress-indicator">
    <div className="progress-steps">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`step ${currentStage >= step ? "active" : ""} ${currentStage > step ? "completed" : ""}`}
        >
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && "Address"}
            {step === 2 && "Payment"}
            {step === 3 && "Confirm"}
          </div>
        </div>
      ))}
    </div>
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${((currentStage - 1) / 2) * 100}%` }}
      ></div>
    </div>
  </div>
);

const AddressStage = ({ checkoutData, handleInputChange }) => (
  <div className="checkout-stage">
    <h2>Delivery Address</h2>
    <div className="form-grid">
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          value={checkoutData.address.fullName}
          onChange={(e) =>
            handleInputChange("address", "fullName", e.target.value)
          }
          placeholder="Enter full name"
          required
        />
      </div>
      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          value={checkoutData.address.email}
          onChange={(e) =>
            handleInputChange("address", "email", e.target.value)
          }
          placeholder="Enter email address"
          required
        />
      </div>
      <div className="form-group full-width">
        <label>Street Address *</label>
        <input
          type="text"
          value={checkoutData.address.street}
          onChange={(e) =>
            handleInputChange("address", "street", e.target.value)
          }
          placeholder="Enter street address"
          required
        />
      </div>
      <div className="form-group">
        <label>City *</label>
        <input
          type="text"
          value={checkoutData.address.city}
          onChange={(e) => handleInputChange("address", "city", e.target.value)}
          placeholder="Enter city"
          required
        />
      </div>
      <div className="form-group">
        <label>State *</label>
        <input
          type="text"
          value={checkoutData.address.state}
          onChange={(e) =>
            handleInputChange("address", "state", e.target.value)
          }
          placeholder="Enter state"
          required
        />
      </div>
      <div className="form-group">
        <label>ZIP Code *</label>
        <input
          type="text"
          value={checkoutData.address.zipCode}
          onChange={(e) =>
            handleInputChange("address", "zipCode", e.target.value)
          }
          placeholder="Enter ZIP code"
          required
        />
      </div>
      <div className="form-group">
        <label>Country *</label>
        <select
          value={checkoutData.address.country}
          onChange={(e) =>
            handleInputChange("address", "country", e.target.value)
          }
        >
          <option value="USA">United States</option>
          <option value="Canada">Canada</option>
          <option value="UK">United Kingdom</option>
          <option value="India">India</option>
        </select>
      </div>
    </div>
  </div>
);

const PaymentStage = ({
  checkoutData,
  handleInputChange,
  handleNestedInputChange,
  handleCardNumberChange,
  handleExpiryChange,
  handleCvvChange,
}) => (
  <div className="checkout-stage">
    <h2>Contact & Payment Information</h2>
    <div className="section">
      <h3>Contact Details</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            value={checkoutData.contact.phoneNumber}
            onChange={(e) =>
              handleInputChange("contact", "phoneNumber", e.target.value)
            }
            placeholder="Enter phone number"
            required
          />
        </div>
        <div className="form-group">
          <label>Alternate Phone (Optional)</label>
          <input
            type="tel"
            value={checkoutData.contact.alternatePhone}
            onChange={(e) =>
              handleInputChange("contact", "alternatePhone", e.target.value)
            }
            placeholder="Enter alternate phone"
          />
        </div>
      </div>
    </div>

    <div className="section">
      <h3>Payment Method</h3>
      <div className="payment-methods">
        {["credit-card", "debit-card", "upi", "paypal", "cod"].map((method) => (
          <div className="payment-option" key={method}>
            <input
              type="radio"
              id={method}
              name="paymentMethod"
              value={method}
              checked={checkoutData.payment.method === method}
              onChange={(e) =>
                handleInputChange("payment", "method", e.target.value)
              }
            />
            <label htmlFor={method}>
              {method === "credit-card" && "💳 Credit Card"}
              {method === "debit-card" && "💳 Debit Card"}
              {method === "upi" && "📱 UPI Payment"}
              {method === "paypal" && "🅿️ PayPal"}
              {method === "cod" && "💵 Cash on Delivery"}
            </label>
          </div>
        ))}
      </div>

      {(checkoutData.payment.method === "credit-card" ||
        checkoutData.payment.method === "debit-card") && (
        <div className="card-details">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Cardholder Name *</label>
              <input
                type="text"
                value={checkoutData.payment.cardDetails.cardholderName}
                onChange={(e) =>
                  handleNestedInputChange(
                    "payment",
                    "cardDetails",
                    "cardholderName",
                    e.target.value,
                  )
                }
                placeholder="Name on card"
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Card Number *</label>
              <input
                type="text"
                value={checkoutData.payment.cardDetails.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="1234567890123456"
                maxLength={16}
                required
              />
            </div>
            <div className="form-group">
              <label>Expiry Date *</label>
              <input
                type="text"
                value={checkoutData.payment.cardDetails.expiryDate}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>
            <div className="form-group">
              <label>CVV *</label>
              <input
                type="text"
                value={checkoutData.payment.cardDetails.cvv}
                onChange={(e) => handleCvvChange(e.target.value)}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { createOrder } = useOrderController();
  const [currentStage, setCurrentStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    totalAmount: 0,
    totalItems: 0,
  });

  const [checkoutData, setCheckoutData] = useState({
    address: {
      fullName: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
    contact: { phoneNumber: "", alternatePhone: "" },
    payment: {
      method: "",
      cardDetails: {
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
      },
    },
    notes: "",
  });

  useEffect(() => {
    if (userRole === "admin") navigate("/admin/dashboard", { replace: true });
  }, [userRole, navigate]);

  useEffect(() => {
    const savedCart = localStorage.getItem("seagull-cart");
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart);
      const totalAmount = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartSummary({ totalAmount, totalItems });
    } else {
      navigate("/user/cart");
    }

    if (user) {
      setCheckoutData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          fullName: user.displayName || "",
          email: user.email || "",
        },
      }));
    }
  }, [user, navigate]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  const handleInputChange = useCallback((section, field, value) => {
    setCheckoutData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, []);

  const handleNestedInputChange = useCallback(
    (section, subsection, field, value) => {
      setCheckoutData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: { ...prev[section][subsection], [field]: value },
        },
      }));
    },
    [],
  );

  const handleCardNumberChange = (value) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 16);
    handleNestedInputChange("payment", "cardDetails", "cardNumber", cleaned);
  };

  const handleExpiryChange = (value) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 4);
    const formatted =
      cleaned.length >= 2
        ? cleaned.substring(0, 2) + "/" + cleaned.substring(2)
        : cleaned;
    handleNestedInputChange("payment", "cardDetails", "expiryDate", formatted);
  };

  const handleCvvChange = (value) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 4);
    handleNestedInputChange("payment", "cardDetails", "cvv", cleaned);
  };

  const validateStage1 = () => {
    const { address } = checkoutData;
    return (
      address.fullName &&
      address.email &&
      address.street &&
      address.city &&
      address.state &&
      address.zipCode
    );
  };

  const validateStage2 = () => {
    const { contact, payment } = checkoutData;
    const phoneValid =
      contact.phoneNumber.trim() &&
      /^\d{10}$/.test(contact.phoneNumber.replace(/\D/g, ""));

    // Check if payment method is selected
    if (!payment.method) return false;

    // For cash on delivery, PayPal, or UPI, only phone validation is required
    if (
      payment.method === "cod" ||
      payment.method === "paypal" ||
      payment.method === "upi"
    ) {
      return phoneValid;
    }

    // For card payments (credit-card or debit-card), validate card details too
    if (payment.method === "credit-card" || payment.method === "debit-card") {
      const cardValid =
        payment.cardDetails.cardNumber.trim() &&
        payment.cardDetails.expiryDate.trim() &&
        payment.cardDetails.cvv.trim() &&
        payment.cardDetails.cardholderName.trim();
      return phoneValid && cardValid;
    }

    // Default: only phone validation for unknown payment methods
    return phoneValid;
  };

  const handlePlaceOrder = async () => {
    // If UPI payment is selected, navigate to UPI payment screen instead
    if (checkoutData.payment.method === "upi") {
      navigate("/user/upi-payment", {
        state: {
          checkoutData,
          cartItems,
          cartSummary,
        },
      });
      return;
    }

    setLoading(true);
    try {
      const order = Order.fromCheckoutData(checkoutData, cartItems, user?.uid);
      const result = await createOrder(order.toFirestore());
      if (result.success) {
        localStorage.removeItem("seagull-cart");
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/user/orders", {
          state: { orderPlaced: true, orderNumber: result.order.orderNumber },
        });
      } else {
        alert(result.error || "Failed to place order.");
      }
    } catch {
      alert("Error placing order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <ProgressIndicator currentStage={currentStage} />
      </div>

      <div className="checkout-content">
        {currentStage === 1 && (
          <AddressStage
            checkoutData={checkoutData}
            handleInputChange={handleInputChange}
          />
        )}

        {currentStage === 2 && (
          <PaymentStage
            checkoutData={checkoutData}
            handleInputChange={handleInputChange}
            handleNestedInputChange={handleNestedInputChange}
            handleCardNumberChange={handleCardNumberChange}
            handleExpiryChange={handleExpiryChange}
            handleCvvChange={handleCvvChange}
          />
        )}

        {currentStage === 3 && (
          <div className="checkout-stage">
            <h2>Order Confirmation</h2>
            <div className="confirmation-sections">
              <div className="confirmation-section">
                <h3>Order Items ({cartSummary.totalItems})</h3>
                <div className="order-items">
                  {cartItems.map((item, index) => (
                    <div key={index} className="order-item">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                      />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                        <p className="item-total">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="confirmation-section">
                <h3>Delivery Summary</h3>
                <div className="address-display">
                  <p>
                    <strong>{checkoutData.address.fullName}</strong>
                  </p>
                  <p>
                    {checkoutData.address.street}, {checkoutData.address.city}
                  </p>
                  <p>
                    {checkoutData.address.state} -{" "}
                    {checkoutData.address.zipCode}
                  </p>
                  <p>Contact: {checkoutData.contact.phoneNumber}</p>
                </div>
              </div>

              <div className="confirmation-section order-total">
                <h3>Order Total</h3>
                <div className="total-breakdown">
                  <div className="total-row final-total">
                    <span>Total Amount:</span>
                    <span>{formatPrice(cartSummary.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="checkout-actions">
          <div className="action-buttons">
            {currentStage > 1 && (
              <button
                onClick={() => setCurrentStage(currentStage - 1)}
                className="btn-secondary"
              >
                Previous
              </button>
            )}
            <button onClick={() => navigate("/user/cart")} className="btn-link">
              Back to Cart
            </button>
            {currentStage < 3 ? (
              <button
                onClick={() => {
                  if (currentStage === 1 && validateStage1())
                    setCurrentStage(2);
                  else if (currentStage === 2 && validateStage2())
                    setCurrentStage(3);
                  else alert("Please fill all required fields");
                }}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                className="btn-success"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;
