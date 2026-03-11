import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import paymentController from "../controllers/paymentController";
import "./PaymentManagement.css";

const PaymentManagement = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const fetchPayments = async () => {
    setLoading(true);
    const result = await paymentController.fetchPayments();
    if (result.success) {
      setPayments(result.data);
    } else {
      alert("Error fetching payments: " + result.error);
    }
    setLoading(false);
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter(
        (payment) => payment.paymentType === selectedType,
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.paymentNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.referenceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.paymentMode.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredPayments(filtered);
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, searchTerm, selectedType]);

  const handleDeletePayment = async (paymentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this payment? This will reverse the payment in the linked invoice/purchase.",
      )
    ) {
      const result = await paymentController.deletePayment(paymentId);
      if (result.success) {
        alert("Payment deleted successfully!");
        fetchPayments();
      } else {
        alert("Error deleting payment: " + result.error);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="payment-management">
      <div className="filter-section">
        <button
          className={`filter-btn ${selectedType === "All" ? "active" : ""}`}
          onClick={() => setSelectedType("All")}
        >
          All ({payments.length})
        </button>
        <button
          className={`filter-btn ${selectedType === "Invoice" ? "active" : ""}`}
          onClick={() => setSelectedType("Invoice")}
        >
          Invoice ({payments.filter((p) => p.paymentType === "Invoice").length})
        </button>
        <button
          className={`filter-btn ${selectedType === "Purchase" ? "active" : ""}`}
          onClick={() => setSelectedType("Purchase")}
        >
          Purchase (
          {payments.filter((p) => p.paymentType === "Purchase").length})
        </button>
        <input
          type="text"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <button
        className="floating-add-btn"
        onClick={() => navigate("/admin/payments/add")}
      >
        + Add Payment
      </button>

      <div className="table-container">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Payment No.</th>
              <th>Type</th>
              <th>Reference No.</th>
              <th>Party Name</th>
              <th>Total Amount</th>
              <th>Payment Amount</th>
              <th>Payment Mode</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No payments found
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <React.Fragment key={payment.id}>
                  <tr>
                    <td className="payment-number">{payment.paymentNumber}</td>
                    <td>
                      <span
                        className={`status-badge ${payment.paymentType.toLowerCase()}`}
                      >
                        {payment.paymentType}
                      </span>
                    </td>
                    <td className="party-name">{payment.referenceNumber}</td>
                    <td className="party-name">{payment.partyName}</td>
                    <td>₹{Number(payment.totalAmount).toFixed(2)}</td>
                    <td className="highlight-amount">
                      ₹{Number(payment.paymentAmount).toFixed(2)}
                    </td>
                    <td>
                      <span className="payment-mode">
                        {payment.paymentMode}
                      </span>
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn-delete"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentManagement;
