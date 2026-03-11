import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import orderService from "../services/orderService";
import "./OrdersScreen.css";

const OrdersScreen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filter, setFilter] = useState("all");

  const loadUserOrders = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await orderService.getUserOrders(user.uid);
      if (result.success) {
        setOrders(
          result.orders.map((o) => ({
            ...o,
            orderDate: o.createdAt || o.orderDate || new Date(),
            status: o.status || "pending",
            items: o.items || [],
          })),
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserOrders();
  }, [loadUserOrders]);

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amt);
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getStatusConfig = (status) => {
    const map = {
      pending: { color: "#e67e22", label: "Pending" },
      processing: { color: "#3498db", label: "Processing" },
      shipped: { color: "#9b59b6", label: "On the way" },
      delivered: { color: "#27ae60", label: "Delivered" },
      cancelled: { color: "#e74c3c", label: "Cancelled" },
    };
    return map[status] || { color: "#7f8c8d", label: status };
  };

  const handleDownloadBill = (order) => {
    // Re-using your robust download logic
    const content = `
      <html><body style="font-family:sans-serif; padding:40px;">
        <h1 style="color:#000; border-bottom:2px solid #000;">SEAGULL-SPORTS</h1>
        <p>Order: ${order.orderNumber} | Date: ${formatDate(order.orderDate)}</p>
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr style="background:#f4f4f4;"><th>Item</th><th>Qty</th><th>Price</th></tr>
          ${order.items.map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${formatCurrency(i.price)}</td></tr>`).join("")}
        </table>
        <h3 style="text-align:right;">Total: ${formatCurrency(order.total)}</h3>
      </body></html>
    `;
    const blob = new Blob([content], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bill-${order.orderNumber}.html`;
    link.click();
  };

  return (
    <div className="orders-wrapper">
      <header className="page-header">
        <h1>Order History</h1>
        <div className="filter-pills">
          {["all", "pending", "shipped", "delivered"].map((f) => (
            <button
              key={f}
              className={`pill ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <section className="orders-feed">
        {loading ? (
          <div className="skeleton-loader">Updating feed...</div>
        ) : (
          orders
            .filter((o) => filter === "all" || o.status === filter)
            .map((order) => (
              <div key={order.id} className="neat-order-card">
                <div className="card-top">
                  <div className="order-id-group">
                    <span className="id-label">Order #</span>
                    <span className="id-value">{order.orderNumber}</span>
                  </div>
                  <div
                    className="status-indicator"
                    style={{ color: getStatusConfig(order.status).color }}
                  >
                    <span
                      className="dot"
                      style={{
                        backgroundColor: getStatusConfig(order.status).color,
                      }}
                    ></span>
                    {getStatusConfig(order.status).label}
                  </div>
                </div>

                <div className="card-mid">
                  <div className="item-previews">
                    {order.items.slice(0, 4).map((item, i) => (
                      <img
                        key={i}
                        src={item.image || "/placeholder.jpg"}
                        alt="item"
                        className="mini-thumb"
                      />
                    ))}
                    {order.items.length > 4 && (
                      <div className="more-count">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="price-summary">
                    <span className="date-sub">
                      {formatDate(order.orderDate)}
                    </span>
                    <span className="price-main">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                  >
                    View Receipt
                  </button>
                  {order.status === "delivered" && (
                    <button
                      className="primary-btn-outline"
                      onClick={() => handleDownloadBill(order)}
                    >
                      Get PDF
                    </button>
                  )}
                </div>
              </div>
            ))
        )}
      </section>

      {/* RECEIPT MODAL */}
      {showOrderDetails && selectedOrder && (
        <div
          className="receipt-overlay"
          onClick={() => setShowOrderDetails(false)}
        >
          <div className="receipt-paper" onClick={(e) => e.stopPropagation()}>
            <button
              className="receipt-close"
              onClick={() => setShowOrderDetails(false)}
            >
              ✕
            </button>
            <div className="receipt-header">
              <h2 className="brand">SEAGULL-SPORTS</h2>
              <p>Official Purchase Record</p>
            </div>

            <div className="receipt-meta">
              <div>
                <strong>ID:</strong> {selectedOrder.orderNumber}
              </div>
              <div>
                <strong>Date:</strong> {formatDate(selectedOrder.orderDate)}
              </div>
            </div>

            <div className="receipt-items">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="receipt-row">
                  <div className="row-main">
                    <span>{item.name}</span>
                    <small>Qty: {item.quantity}</small>
                  </div>
                  <span className="row-price">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="receipt-total">
              <span>Total Paid</span>
              <span>{formatCurrency(selectedOrder.total)}</span>
            </div>

            <button
              className="print-btn"
              onClick={() => handleDownloadBill(selectedOrder)}
            >
              Download Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersScreen;
