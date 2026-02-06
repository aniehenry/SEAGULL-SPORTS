import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import itemController from "./item/controllers/itemController";
import invoiceController from "./invoice/controllers/invoiceController";
import purchaseController from "./purchase/controllers/purchaseController";
import * as orderController from "./order/controllers/orderController";
import paymentController from "./payment/controllers/paymentController";
import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users who accidentally access admin dashboard
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      console.log(
        "Non-admin user detected on admin page, redirecting to user home",
      );
      navigate("/user/home", { replace: true });
    }
  }, [userRole, navigate]);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalPurchase: 0,
    totalSales: 0,
    totalOrders: 0,
    paymentsIn: 0,
    paymentsOut: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleActivityClick = (activity) => {
    if (activity.type === "Invoice") {
      navigate("/admin/invoices");
    } else if (activity.type === "Purchase") {
      navigate("/admin/purchases");
    } else if (activity.type === "Order") {
      navigate(`/admin/orders/${activity.id}`);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    console.log("=== DASHBOARD DATA FETCH START ===");
    console.log("Current User:", currentUser);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch Items - Result is in .data
      const itemsRes = await itemController.fetchItems();
      console.log("Items Response:", itemsRes);
      const totalProducts =
        itemsRes.success && itemsRes.data ? itemsRes.data.length : 0;
      console.log("Total Products:", totalProducts);

      // 2. Fetch Invoices - Result is in .data
      const invRes = await invoiceController.fetchInvoices();
      console.log("Invoices Response:", invRes);
      const totalSales =
        invRes.success && invRes.data
          ? invRes.data.reduce(
              (sum, inv) => sum + (Number(inv.totalAmount) || 0),
              0,
            )
          : 0;
      console.log("Total Sales:", totalSales);

      // 3. Fetch Purchases - Result is in .data
      const purRes = await purchaseController.fetchPurchases();
      console.log("Purchases Response:", purRes);
      const totalPurchase =
        purRes.success && purRes.data
          ? purRes.data.reduce(
              (sum, pur) => sum + (Number(pur.totalAmount) || 0),
              0,
            )
          : 0;
      console.log("Total Purchase:", totalPurchase);

      // 4. Fetch Orders - Result is in .orders
      const ordRes = await orderController.fetchOrders(currentUser.uid);
      console.log("Orders Response:", ordRes);
      const totalOrders =
        ordRes.success && ordRes.orders ? ordRes.orders.length : 0;
      console.log("Total Orders:", totalOrders);

      // 5. Fetch Payments - Sum In/Out
      const payRes = await paymentController.fetchPayments();
      console.log("Payments Response:", payRes);
      let paymentsIn = 0;
      let paymentsOut = 0;
      if (payRes.success && payRes.data) {
        payRes.data.forEach((p) => {
          const amt = Number(p.paymentAmount) || 0;
          if (p.referenceType === "Invoice") paymentsIn += amt;
          else if (p.referenceType === "Purchase") paymentsOut += amt;
        });
      }
      console.log("Payments IN:", paymentsIn, "Payments OUT:", paymentsOut);

      setStats({
        totalProducts,
        totalPurchase,
        totalSales,
        totalOrders,
        paymentsIn,
        paymentsOut,
      });

      // Build Recent Activities List
      const activities = [];

      if (invRes.data) {
        invRes.data.slice(-3).forEach((inv) =>
          activities.push({
            id: inv.id,
            date: inv.invoiceDate,
            type: "Invoice",
            description: `${inv.invoiceNumber} - ${inv.partyName}`,
            amount: Number(inv.totalAmount) || 0,
            status: inv.paymentStatus || "Unpaid",
          }),
        );
      }

      if (purRes.data) {
        purRes.data.slice(-3).forEach((pur) =>
          activities.push({
            id: pur.id,
            date: pur.purchaseDate,
            type: "Purchase",
            description: `${pur.purchaseNumber} - ${pur.partyName}`,
            amount: Number(pur.totalAmount) || 0,
            status: pur.paymentStatus || "Unpaid",
          }),
        );
      }

      if (ordRes.orders) {
        ordRes.orders.slice(-3).forEach((ord) =>
          activities.push({
            id: ord.id,
            date: ord.orderDate,
            type: "Order",
            description: `${ord.orderNumber} - ${ord.partyName || "Walk-in"}`,
            amount: Number(ord.totalAmount) || 0,
            status: ord.status || "Pending",
          }),
        );
      }

      // Sort by date descending and take top 10
      const sorted = activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      setRecentActivities(sorted);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="loading-spinner">Loading Data...</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="stat-card purple">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
            <div className="stat-card blue">
              <h3>₹{stats.totalPurchase.toLocaleString()}</h3>
              <p>Total Purchase</p>
            </div>
            <div className="stat-card green">
              <h3>₹{stats.totalSales.toLocaleString()}</h3>
              <p>Total Sales</p>
            </div>
            <div className="stat-card orange">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
            <div className="stat-card cyan">
              <h3>₹{stats.paymentsIn.toLocaleString()}</h3>
              <p>Payments IN</p>
            </div>
            <div className="stat-card red">
              <h3>₹{stats.paymentsOut.toLocaleString()}</h3>
              <p>Payments OUT</p>
            </div>
          </div>

          <div className="activities-section">
            <h2 className="section-title">Recent Activities</h2>
            <div className="table-container">
              <table className="activities-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <tr
                        key={index}
                        onClick={() => handleActivityClick(activity)}
                        className="activity-row"
                      >
                        <td>{new Date(activity.date).toLocaleDateString()}</td>
                        <td>{activity.type}</td>
                        <td>{activity.description}</td>
                        <td>₹{activity.amount.toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-badge ${activity.status?.toLowerCase()}`}
                          >
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
