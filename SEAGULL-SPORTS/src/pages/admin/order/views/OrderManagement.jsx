import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import * as orderController from "../controllers/orderController";
import "./OrderManagement.css";

const OrderManagement = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchOrders = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await orderController.fetchOrders(currentUser.uid);

      if (result.success) {
        setOrders(result.orders);
        setFilteredOrders(result.orders);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (status) => {
    setFilterStatus(status);
    if (status === "All") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === status));
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      const result = await orderController.deleteOrder(
        currentUser.uid,
        orderId,
      );

      if (result.success) {
        fetchOrders();
        alert("Order deleted successfully!");
      } else {
        alert(result.error || "Failed to delete order");
      }
    } catch (err) {
      alert("An error occurred while deleting order");
      console.error(err);
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

  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus) {
      case "Paid":
        return "payment-paid";
      case "Partially Paid":
        return "payment-partial";
      default:
        return "payment-unpaid";
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="order-management">
      <div className="order-header">
        <div>
          <h1 className="order-title">Orders</h1>
          <p className="order-subtitle">Manage and track customer orders</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-chips">
        <button
          className={`chip ${filterStatus === "All" ? "active" : ""}`}
          onClick={() => filterOrders("All")}
        >
          All Orders
        </button>
        <button
          className={`chip ${filterStatus === "Pending" ? "active" : ""}`}
          onClick={() => filterOrders("Pending")}
        >
          Pending
        </button>
        <button
          className={`chip ${filterStatus === "Processing" ? "active" : ""}`}
          onClick={() => filterOrders("Processing")}
        >
          Processing
        </button>
        <button
          className={`chip ${filterStatus === "Completed" ? "active" : ""}`}
          onClick={() => filterOrders("Completed")}
        >
          Completed
        </button>
        <button
          className={`chip ${filterStatus === "Cancelled" ? "active" : ""}`}
          onClick={() => filterOrders("Cancelled")}
        >
          Cancelled
        </button>
      </div>

      <div className="table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td className="order-number">{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.customerPhone}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>{order.items.length} items</td>
                  <td className="amount">₹{order.totalAmount.toFixed(2)}</td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`payment-badge ${getPaymentStatusClass(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleViewOrder(order.orderId)}
                        title="View Order"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteOrder(order.orderId)}
                        title="Delete Order"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
