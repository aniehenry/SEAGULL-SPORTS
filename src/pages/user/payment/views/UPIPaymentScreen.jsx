import React, { useState, useEffect, } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../../../contexts/AuthContext";
import useOrderController from "../../order/controllers/orderController";
import Order from "../../order/models/Order";
import "./UPIPaymentScreen.css";

const UPIPaymentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createOrder } = useOrderController();

  const [view, setView] = useState("bill");
  const [timeLeft, setTimeLeft] = useState(300);
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const { checkoutData, cartItems, cartSummary } = location.state || {};

  // Redirect if data is missing
  useEffect(() => {
    if (!checkoutData || !cartItems) {
      navigate("/user/checkout");
    }
  }, [checkoutData, cartItems, navigate]);

  // FIXED: Timer Logic - Handling expiration inside the callback to avoid ESLint warning
  useEffect(() => {
    let timer;
    if (view === "qr" && timeLeft > 0 && !paymentDone) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            alert("Payment session expired.");
            setView("bill"); // Now safe because it's in a callback
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, paymentDone]); // Removed timeLeft from dependencies to prevent infinite loops

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const upiString = `upi://pay?pa=seagullsports@upi&pn=SEAGULL%20SPORTS&am=${cartSummary?.totalAmount}&cu=INR&tn=Order%20Payment`;

  const handleFinalSubmit = async () => {
    setProcessing(true);

    setTimeout(async () => {
      try {
        const order = Order.fromCheckoutData(
          checkoutData,
          cartItems,
          user?.uid,
        );
        order.paymentStatus = "paid";
        order.paymentMethod = "UPI";

        const result = await createOrder(order.toFirestore());

        if (result.success) {
          setPaymentDone(true);
          localStorage.removeItem("seagull-cart");
          window.dispatchEvent(new Event("cartUpdated"));

          setTimeout(() => {
            navigate("/user/products");
          }, 2000);
        } else {
          alert(result.error || "Order creation failed.");
          setProcessing(false);
        }
      } catch (error) {
        console.error("Payment Error:", error);
        setProcessing(false);
      }
    }, 2500);
  };

  if (!checkoutData) return null;

  return (
    <div className="payment-page-wrapper">
      <div className="payment-modal">
        <div className="checkout-steps">
          <div className="step-item completed">Shipping</div>
          <div className="step-divider active"></div>
          <div className="step-item active">Payment</div>
          <div className="step-divider"></div>
          <div className="step-item">Review</div>
        </div>

        {view === "bill" ? (
          <div className="bill-view fade-in">
            <div className="payment-header">
              <h2>Invoice Summary</h2>
              <p>Please review your order details</p>
            </div>

            <div className="invoice-box">
              <div className="invoice-row">
                <span>Merchant</span>
                <span className="text-dark">SEAGULL SPORTS</span>
              </div>
              <div className="invoice-row">
                <span>Items ({cartSummary.totalItems})</span>
                <span className="text-dark">
                  {formatCurrency(cartSummary.totalAmount)}
                </span>
              </div>
              <div className="invoice-divider"></div>
              <div className="invoice-row total">
                <span>Total Amount</span>
                <span className="amount-highlight">
                  {formatCurrency(cartSummary.totalAmount)}
                </span>
              </div>
            </div>

            <button
              className="btn-pay-next"
              onClick={() => {
                setView("qr");
                setTimeLeft(300);
              }}
            >
              Continue to UPI Payment
            </button>
            <button
              className="btn-back-link"
              onClick={() => navigate("/user/checkout")}
            >
              Back to Shipping
            </button>
          </div>
        ) : (
          <div className="qr-view fade-in">
            <div className="qr-header-info">
              <div className="timer-pill">
                Expires in {formatTime(timeLeft)}
              </div>
              <h3>Scan UPI QR Code</h3>
            </div>

            <div className="qr-display-card">
              <QRCodeSVG value={upiString} size={180} level="M" />
            </div>

            <div className="payment-confirmation-details">
              <p className="p-merchant">
                Paying to: <strong>SEAGULL SPORTS</strong>
              </p>
              <p className="p-amount">
                {formatCurrency(cartSummary.totalAmount)}
              </p>
            </div>

            <div className="action-footer">
              <button
                className={`btn-complete ${processing ? "is-loading" : ""} ${paymentDone ? "is-success" : ""}`}
                onClick={handleFinalSubmit}
                disabled={processing || paymentDone}
              >
                {paymentDone
                  ? "✔ Payment Completed"
                  : processing
                    ? "Verifying Transaction..."
                    : "I have completed payment"}
              </button>

              {!processing && !paymentDone && (
                <button
                  className="btn-cancel-text"
                  onClick={() => setView("bill")}
                >
                  Cancel and Go Back
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UPIPaymentScreen;
