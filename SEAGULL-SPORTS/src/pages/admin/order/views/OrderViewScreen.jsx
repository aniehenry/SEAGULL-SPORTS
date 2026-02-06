import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import * as orderController from "../controllers/orderController";
import "./OrderViewScreen.css";

const OrderViewScreen = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, currentUser]);

  const fetchOrderDetails = async () => {
    if (!currentUser || !orderId) return;

    setLoading(true);
    setError("");

    try {
      const result = await orderController.fetchOrderById(
        currentUser.uid,
        orderId,
      );

      if (result.success) {
        setOrder(result.order);
      } else {
        setError(result.error || "Failed to fetch order details");
      }
    } catch (err) {
      setError("An error occurred while fetching order details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (
      !window.confirm(`Are you sure you want to change status to ${newStatus}?`)
    ) {
      return;
    }

    setUpdating(true);

    try {
      const result = await orderController.updateOrderStatus(
        currentUser.uid,
        orderId,
        newStatus,
      );

      if (result.success) {
        setOrder({ ...order, status: newStatus });
        alert("Order status updated successfully!");
      } else {
        alert(result.error || "Failed to update status");
      }
    } catch (err) {
      alert("An error occurred while updating status");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to change payment status to ${newPaymentStatus}?`,
      )
    ) {
      return;
    }

    setUpdating(true);

    try {
      const result = await orderController.updatePaymentStatus(
        currentUser.uid,
        orderId,
        newPaymentStatus,
      );

      if (result.success) {
        setOrder({ ...order, paymentStatus: newPaymentStatus });
        alert("Payment status updated successfully!");
      } else {
        alert(result.error || "Failed to update payment status");
      }
    } catch (err) {
      alert("An error occurred while updating payment status");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "completed":
        return "status-completed";
      case "processing":
        return "status-processing";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="btn-back" onClick={() => navigate("/admin/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return <div className="error-message">Order not found</div>;
  }

  return (
    <div className="order-view-screen">
      <div className="view-header">
        <button className="btn-back" onClick={() => navigate("/admin/orders")}>
          ← Back to Orders
        </button>
        <h1 className="view-title">Order Details</h1>
      </div>

      <div className="order-details-container">
        {/* Order Info Card */}
        <div className="details-card">
          <div className="card-header">
            <h2>Order Information</h2>
            <span className={`status-badge ${getStatusClass(order.status)}`}>
              {(order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)}
            </span>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Order Number:</span>
              <span className="info-value order-number">
                {order.orderNumber || `ORD-${order.orderId?.slice(-8)}`}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Date:</span>
              <span className="info-value">
                {order.orderDate ? new Date(order.orderDate).toLocaleString() : "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Status:</span>
              <div className="status-buttons">
                <button
                  className={`status-btn ${(order.status || "pending").toLowerCase() === "pending" ? "active" : ""}`}
                  onClick={() => handleStatusChange("pending")}
                  disabled={updating}
                >
                  Pending
                </button>
                <button
                  className={`status-btn ${(order.status || "pending").toLowerCase() === "processing" ? "active" : ""}`}
                  onClick={() => handleStatusChange("processing")}
                  disabled={updating}
                >
                  Processing
                </button>
                <button
                  className={`status-btn ${(order.status || "pending").toLowerCase() === "completed" ? "active" : ""}`}
                  onClick={() => handleStatusChange("completed")}
                  disabled={updating}
                >
                  Completed
                </button>
                <button
                  className={`status-btn ${(order.status || "pending").toLowerCase() === "cancelled" ? "active" : ""}`}
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={updating}
                >
                  Cancelled
                </button>
              </div>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Status:</span>
              <div className="status-buttons">
                <button
                  className={`payment-btn ${(order.paymentStatus || "pending").toLowerCase() === "pending" ? "active" : ""}`}
                  onClick={() => handlePaymentStatusChange("pending")}
                  disabled={updating}
                >
                  Pending
                </button>
                <button
                  className={`payment-btn ${(order.paymentStatus || "pending").toLowerCase() === "paid" ? "active" : ""}`}
                  onClick={() => handlePaymentStatusChange("paid")}
                  disabled={updating}
                >
                  Paid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="details-card">
          <div className="card-header">
            <h2>Customer Information</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Customer ID:</span>
              <span className="info-value">{order.userId || order.customerName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{order.customerPhone || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{order.customerEmail || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Customer Notes:</span>
              <span className="info-value">
                {order.customerNotes || "No notes provided"}
              </span>
            </div>
            {order.deliveryAddress && (
              <div className="info-row">
                <span className="info-label">Delivery Address:</span>
                <span className="info-value">{order.deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Card */}
        <div className="details-card items-card">
          <div className="card-header">
            <h2>Order Items</h2>
          </div>
          <div className="card-body">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Image</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-category">{item.category}</div>
                      </div>
                    </td>
                    <td>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="item-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                        }}
                      />
                    </td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {order.subtotal && (
                  <tr>
                    <td colSpan="4" className="total-label">Subtotal:</td>
                    <td className="total-amount">₹{order.subtotal.toFixed(2)}</td>
                  </tr>
                )}
                {order.tax > 0 && (
                  <tr>
                    <td colSpan="4" className="total-label">Tax:</td>
                    <td className="total-amount">₹{order.tax.toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="4" className="total-label">Total Amount:</td>
                  <td className="total-amount">₹{order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes Card */}
        {order.notes && (
          <div className="details-card">
            <div className="card-header">
              <h2>Notes</h2>
            </div>
            <div className="card-body">
              <p className="notes-text">{order.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderViewScreen;
