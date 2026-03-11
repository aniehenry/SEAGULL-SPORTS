import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import invoiceController from "../controllers/invoiceController";
import "./InvoiceManagement.css";

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoiceController.fetchInvoices();
      if (result.success) {
        setInvoices(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      const result = await invoiceController.deleteInvoice(invoiceId);
      if (result.success) {
        setInvoices(invoices.filter((invoice) => invoice.id !== invoiceId));
      } else {
        alert("Failed to delete invoice: " + result.error);
      }
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesFilter = filter === "All" || invoice.paymentStatus === filter;
    const matchesSearch =
      searchQuery === "" ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.partyName.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="invoice-management">
      <div className="filter-section">
        <button
          className={`filter-btn ${filter === "All" ? "active" : ""}`}
          onClick={() => setFilter("All")}
        >
          All ({invoices.length})
        </button>
        <button
          className={`filter-btn ${filter === "Paid" ? "active" : ""}`}
          onClick={() => setFilter("Paid")}
        >
          Paid ({invoices.filter((i) => i.paymentStatus === "Paid").length})
        </button>
        <button
          className={`filter-btn ${filter === "Unpaid" ? "active" : ""}`}
          onClick={() => setFilter("Unpaid")}
        >
          Unpaid ({invoices.filter((i) => i.paymentStatus === "Unpaid").length})
        </button>
        <button
          className={`filter-btn ${filter === "Partially Paid" ? "active" : ""}`}
          onClick={() => setFilter("Partially Paid")}
        >
          Partially Paid (
          {invoices.filter((i) => i.paymentStatus === "Partially Paid").length})
        </button>
        <input
          type="text"
          className="search-input"
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <button
        className="floating-add-btn"
        onClick={() => navigate("/admin/invoices/add")}
      >
        + Add
      </button>

      {loading ? (
        <div className="loading">Loading invoices...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice #</th>
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
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No invoices found. Click "+ Add" to create one.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const totalQty =
                    invoice.items?.reduce(
                      (sum, item) => sum + (Number(item.quantity) || 0),
                      0,
                    ) || 0;
                  return (
                    <tr key={invoice.id}>
                      <td className="invoice-number">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="party-name">{invoice.partyName}</td>
                      <td>{totalQty}</td>
                      <td>₹{invoice.totalAmount.toFixed(2)}</td>
                      <td>₹{invoice.paidAmount.toFixed(2)}</td>
                      <td className="due-amount">
                        ₹{invoice.dueAmount.toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(invoice.paymentStatus)}`}
                        >
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td>{formatDate(invoice.createdAt)}</td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() =>
                            navigate(`/admin/invoices/edit/${invoice.id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
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

export default InvoiceManagement;
