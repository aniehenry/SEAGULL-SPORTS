import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import useCartController from "../controllers/cartController";
import "./CartView.css";

const CartView = () => {
  const navigate = useNavigate();
  const { user, logout, userRole } = useAuth();
  const {
    cartItems,
    loading,
    error,
    handleRemoveItem,
    handleClearCart,
    getCartSummary,
    increaseQuantity,
    decreaseQuantity,
    handleCheckout
  } = useCartController();

  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');

  // Redirect admin users
  useEffect(() => {
    if (userRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [userRole, navigate]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRemove = async (itemId) => {
    const result = await handleRemoveItem(itemId);
    if (result.success) {
      showNotification("Item removed from cart", "success");
    } else {
      showNotification(result.message || "Failed to remove item", "error");
    }
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      const result = await handleClearCart();
      if (result.success) {
        showNotification("Cart cleared successfully", "success");
      } else {
        showNotification(result.message || "Failed to clear cart", "error");
      }
    }
  };

  const handleProceedToPurchase = async () => {
    if (cartSummary.isEmpty) {
      showNotification("Your cart is empty", "error");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await handleCheckout(customerNotes);
      
      if (result.success) {
        showNotification("Order placed successfully! Your order has been saved.", "success");
        setCustomerNotes('');
      } else {
        showNotification(result.error || "Failed to process checkout", "error");
      }
    } catch (error) {
      showNotification("Failed to process checkout: " + error.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const cartSummary = getCartSummary();

  if (loading) {
    return (
      <div className="cart-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-view">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <div className="cart-content">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {cartSummary.isEmpty ? (
          <div className="empty-cart">
            <div className="empty-cart-content">
              <span className="empty-cart-icon">🛒</span>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <button
                onClick={() => navigate("/user/products")}
                className="shop-now-btn"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items">
              <div className="cart-items-header">
                <h3>Items ({cartSummary.totalItems})</h3>
                {cartItems.length > 1 && (
                  <button onClick={handleClear} className="clear-cart-btn">
                    Clear All
                  </button>
                )}
              </div>

              <div className="items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                        }}
                      />
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-price">{formatPrice(item.price)}</p>
                      <p className="item-stock">Max available: {item.maxStock}</p>
                    </div>
                    
                    <div className="item-quantity">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="quantity-btn decrease"
                      >
                        -
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="quantity-btn increase"
                        disabled={!item.canIncreaseQuantity()}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      <span className="total-price">{formatPrice(item.getTotalPrice())}</span>
                    </div>
                    
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="remove-item-btn"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                
                <div className="order-notes">
                  <label htmlFor="customerNotes" className="notes-label">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    id="customerNotes"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Add any special instructions for your order..."
                    className="notes-textarea"
                    rows={3}
                  />
                </div>
                
                <div className="summary-row">
                  <span>Subtotal ({cartSummary.totalItems} items)</span>
                  <span>{formatPrice(cartSummary.totalAmount)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatPrice(cartSummary.totalAmount)}</span>
                </div>
                
                <button
                  onClick={handleProceedToPurchase}
                  className={`checkout-btn ${isProcessing ? 'processing' : ''}`}
                  disabled={isProcessing || cartSummary.isEmpty}
                >
                  {isProcessing ? (
                    <>
                      <div className="processing-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
                
                <div className="payment-info">
                  <p>🔒 Secure checkout</p>
                  <p>💳 Multiple payment options available</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartView;