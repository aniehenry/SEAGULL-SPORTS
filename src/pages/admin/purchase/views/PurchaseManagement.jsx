import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import purchaseController from "../controllers/purchaseController";
import "./PurchaseManagement.css";

const PurchaseManagement = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await purchaseController.fetchPurchases();
      if (result.success) {
        setPurchases(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (purchaseId) => {
    if (window.confirm("Are you sure you want to delete this purchase?")) {
      const result = await purchaseController.deletePurchase(purchaseId);
      if (result.success) {
        setPurchases(
          purchases.filter((purchase) => purchase.id !== purchaseId),
        );
      } else {
        alert("Failed to delete purchase: " + result.error);
      }
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesFilter = filter === "All" || purchase.paymentStatus === filter;
    const matchesSearch =
      searchQuery === "" ||
      purchase.purchaseNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      purchase.partyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Paid":
        return "status-paid";
      case "Unpaid":
        return "status-unpaid";
      case "Partially Paid":
        return "status-partial";
      default:
        return "";
    }
  };

  return (
    <div className="purchase-management">
      <div className="filter-section">
        <button
          className={`filter-btn ${filter === "All" ? "active" : ""}`}
          onClick={() => setFilter("All")}
        >
          All ({purchases.length})
        </button>
        <button
          className={`filter-btn ${filter === "Paid" ? "active" : ""}`}
          onClick={() => setFilter("Paid")}
        >
          Paid ({purchases.filter((p) => p.paymentStatus === "Paid").length})
        </button>
        <button
          className={`filter-btn ${filter === "Unpaid" ? "active" : ""}`}
          onClick={() => setFilter("Unpaid")}
        >
          Unpaid ({purchases.filter((p) => p.paymentStatus === "Unpaid").length}
          )
        </button>
        <button
          className={`filter-btn ${filter === "Partially Paid" ? "active" : ""}`}
          onClick={() => setFilter("Partially Paid")}
        >
          Partially Paid (
          {purchases.filter((p) => p.paymentStatus === "Partially Paid").length}
          )
        </button>
        <input
          type="text"
          className="search-input"
          placeholder="Search purchases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: "250px" }}
        />
      </div>

      <button
        className="floating-add-btn"
        onClick={() => navigate("/admin/purchases/add")}
      >
        + Add
      </button>

      {loading ? (
        <div className="loading">Loading purchases...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-container">
          <table className="purchase-table">
            <thead>
              <tr>
                <th>Purchase #</th>
                <th>Party Name</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Due Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No purchases found. Click "+ Add" to create one.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => {
                  const totalQty =
                    purchase.items?.reduce(
                      (sum, item) => sum + (Number(item.quantity) || 0),
                      0,
                    ) || 0;
                  return (
                    <React.Fragment key={purchase.id}>
                      <tr>
                        <td className="purchase-number">
                          {purchase.purchaseNumber}
                        </td>
                        <td className="party-name">{purchase.partyName}</td>
                        <td>{totalQty}</td>
                        <td>₹{Number(purchase.totalAmount || 0).toFixed(2)}</td>
                        <td>₹{Number(purchase.paidAmount || 0).toFixed(2)}</td>
                        <td className="due-amount">
                          ₹{Number(purchase.dueAmount || 0).toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(purchase.paymentStatus)}`}
                          >
                            {purchase.paymentStatus}
                          </span>
                        </td>
                        <td>{formatDate(purchase.createdAt)}</td>
                        <td className="actions">
                          <button
                            className="btn-edit"
                            onClick={() =>
                              navigate(`/admin/purchases/edit/${purchase.id}`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(purchase.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseManagement;
