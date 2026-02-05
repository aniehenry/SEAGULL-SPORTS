import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as itemController from "./item/controllers/itemController";
import * as invoiceController from "./invoice/controllers/invoiceController";
import * as purchaseController from "./purchase/controllers/purchaseController";
import * as orderController from "./order/controllers/orderController";
import * as paymentController from "./payment/controllers/paymentController";
import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();
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

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch items
      const itemsResult = await itemController.fetchItems(currentUser.uid);
      console.log("Items Result:", itemsResult);
      const totalProducts = itemsResult.success ? itemsResult.items.length : 0;

      // Fetch invoices
      const invoicesResult = await invoiceController.fetchInvoices(
        currentUser.uid,
      );
      console.log("Invoices Result:", invoicesResult);
      const totalSales = invoicesResult.success
        ? invoicesResult.invoices.reduce(
            (sum, invoice) => sum + invoice.totalAmount,
            0,
          )
        : 0;

      // Fetch purchases
      let totalPurchase = 0;
      try {
        const purchasesResult = await purchaseController.fetchPurchases(
          currentUser.uid,
        );
        totalPurchase = purchasesResult.success
          ? purchasesResult.purchases.reduce(
              (sum, purchase) => sum + purchase.totalAmount,
              0,
            )
          : 0;
      } catch (err) {
        console.log("Purchase controller not available:", err);
      }

      // Fetch orders
      let totalOrders = 0;
      try {
        const ordersResult = await orderController.fetchOrders(currentUser.uid);
        totalOrders = ordersResult.success ? ordersResult.orders.length : 0;
      } catch (err) {
        console.log("Order controller not available:", err);
      }

      // Fetch payments
      let paymentsIn = 0;
      let paymentsOut = 0;
      try {
        const paymentsResult = await paymentController.fetchPayments(
          currentUser.uid,
        );
        if (paymentsResult.success) {
          paymentsResult.payments.forEach((payment) => {
            if (payment.referenceType === "Invoice") {
              paymentsIn += payment.paymentAmount;
            } else if (payment.referenceType === "Purchase") {
              paymentsOut += payment.paymentAmount;
            }
          });
        }
      } catch (err) {
        console.log("Payment controller not available:", err);
      }

      setStats({
        totalProducts,
        totalPurchase,
        totalSales,
        totalOrders,
        paymentsIn,
        paymentsOut,
      });

      // Build recent activities
      const activities = [];

      if (invoicesResult.success) {
        invoicesResult.invoices.slice(0, 5).forEach((invoice) => {
          activities.push({
            date: new Date(invoice.invoiceDate).toLocaleDateString(),
            type: "Invoice",
            description: `${invoice.invoiceNumber} - ${invoice.partyName}`,
            amount: `₹${invoice.totalAmount.toFixed(2)}`,
            status: invoice.paymentStatus,
          });
        });
      }

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="loading-message">Loading dashboard data...</div>
      ) : (
        <>
          <div className="dashboard-grid">
            {/* Total Products */}
            <div className="stat-card">
              <div className="stat-indicator purple"></div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.totalProducts}</h3>
                <p className="stat-label">Total Products</p>
                <span className="stat-description">All Items</span>
              </div>
            </div>

            {/* Total Purchase */}
            <div className="stat-card">
              <div className="stat-indicator blue"></div>
              <div className="stat-content">
                <h3 className="stat-value">
                  ₹{stats.totalPurchase.toLocaleString()}
                </h3>
                <p className="stat-label">Total Purchase</p>
                <span className="stat-description">All Purchase Orders</span>
              </div>
            </div>

            {/* Total Sales */}
            <div className="stat-card">
              <div className="stat-indicator green"></div>
              <div className="stat-content">
                <h3 className="stat-value">
                  ₹{stats.totalSales.toLocaleString()}
                </h3>
                <p className="stat-label">Total Sales</p>
                <span className="stat-description">All Invoices</span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="stat-card">
              <div className="stat-indicator orange"></div>
              <div className="stat-content">
                <h3 className="stat-value">{stats.totalOrders}</h3>
                <p className="stat-label">Total Orders</p>
                <span className="stat-description">Completed Orders</span>
              </div>
            </div>

            {/* Payments IN */}
            <div className="stat-card payment-card">
              <div className="stat-indicator cyan"></div>
              <div className="stat-content">
                <h3 className="stat-value">
                  ₹{stats.paymentsIn.toLocaleString()}
                </h3>
                <p className="stat-label">Payments IN</p>
                <span className="stat-description">Received Payments</span>
              </div>
            </div>

            {/* Payments OUT */}
            <div className="stat-card payment-card">
              <div className="stat-indicator red"></div>
              <div className="stat-content">
                <h3 className="stat-value">
                  ₹{stats.paymentsOut.toLocaleString()}
                </h3>
                <p className="stat-label">Payments OUT</p>
                <span className="stat-description">Paid to Vendors</span>
              </div>
            </div>
          </div>

          {/* Recent Activities Table */}
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
                        No recent activities found
                      </td>
                    </tr>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <tr key={index}>
                        <td>{activity.date}</td>
                        <td>{activity.type}</td>
                        <td>{activity.description}</td>
                        <td>{activity.amount}</td>
                        <td>
                          <span className={`status-badge ${activity.status}`}>
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
