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
    switch (status) {
      case "Completed":
        return "status-completed";
      case "Processing":
        return "status-processing";
      case "Cancelled":
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
              {order.status}
            </span>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Order Number:</span>
              <span className="info-value order-number">
                {order.orderNumber}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Date:</span>
              <span className="info-value">
                {new Date(order.orderDate).toLocaleString()}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Status:</span>
              <div className="status-buttons">
                <button
                  className={`status-btn ${order.status === "Pending" ? "active" : ""}`}
                  onClick={() => handleStatusChange("Pending")}
                  disabled={updating}
                >
                  Pending
                </button>
                <button
                  className={`status-btn ${order.status === "Processing" ? "active" : ""}`}
                  onClick={() => handleStatusChange("Processing")}
                  disabled={updating}
                >
                  Processing
                </button>
                <button
                  className={`status-btn ${order.status === "Completed" ? "active" : ""}`}
                  onClick={() => handleStatusChange("Completed")}
                  disabled={updating}
                >
                  Completed
                </button>
                <button
                  className={`status-btn ${order.status === "Cancelled" ? "active" : ""}`}
                  onClick={() => handleStatusChange("Cancelled")}
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
                  className={`payment-btn ${order.paymentStatus === "Unpaid" ? "active" : ""}`}
                  onClick={() => handlePaymentStatusChange("Unpaid")}
                  disabled={updating}
                >
                  Unpaid
                </button>
                <button
                  className={`payment-btn ${order.paymentStatus === "Partially Paid" ? "active" : ""}`}
                  onClick={() => handlePaymentStatusChange("Partially Paid")}
                  disabled={updating}
                >
                  Partially Paid
                </button>
                <button
                  className={`payment-btn ${order.paymentStatus === "Paid" ? "active" : ""}`}
                  onClick={() => handlePaymentStatusChange("Paid")}
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
              <span className="info-label">Name:</span>
              <span className="info-value">{order.customerName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{order.customerPhone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{order.customerEmail || "N/A"}</span>
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
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemName}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="total-label">
                    Total Amount:
                  </td>
                  <td className="total-amount">
                    ₹{order.totalAmount.toFixed(2)}
                  </td>
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
