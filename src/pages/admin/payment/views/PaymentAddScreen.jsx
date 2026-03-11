import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import paymentController from "../controllers/paymentController";
import paymentService from "../services/paymentService";
import invoiceService from "../../invoice/services/invoiceService";
import purchaseService from "../../purchase/services/purchaseService";
import "./PaymentAddScreen.css";

const PaymentAddScreen = () => {
  const navigate = useNavigate();
  const [paymentNumber, setPaymentNumber] = useState("");
  const [paymentType, setPaymentType] = useState("Invoice");
  const [references, setReferences] = useState([]);
  const [selectedReference, setSelectedReference] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePaymentNumber = async () => {
    const number = await paymentService.generatePaymentNumber();
    setPaymentNumber(number);
  };

  const fetchReferences = async () => {
    try {
      if (paymentType === "Invoice") {
        const invoices = await invoiceService.getAllInvoices();
        // Filter for unpaid or partially paid invoices
        const unpaidInvoices = invoices.filter(
          (inv) => inv.paymentStatus !== "Paid",
        );
        setReferences(unpaidInvoices);
      } else {
        const purchases = await purchaseService.getAllPurchases();
        // Filter for unpaid or partially paid purchases
        const unpaidPurchases = purchases.filter(
          (pur) => pur.paymentStatus !== "Paid",
        );
        setReferences(unpaidPurchases);
      }
    } catch (error) {
      console.error("Error fetching references:", error);
      alert("Error loading data: " + error.message);
    }
  };

  useEffect(() => {
    generatePaymentNumber();
  }, []);

  useEffect(() => {
    fetchReferences();
    setSelectedReference(null);
    setPaymentAmount("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentType]);

  const handleReferenceSelect = (refId) => {
    const reference = references.find((r) => r.id === refId);
    setSelectedReference(reference);
    // Auto-fill with due amount
    if (reference) {
      setPaymentAmount(reference.dueAmount || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedReference) {
      alert("Please select an invoice or purchase");
      return;
    }

    if (!paymentAmount || paymentAmount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (Number(paymentAmount) > Number(selectedReference.dueAmount)) {
      alert("Payment amount cannot exceed due amount");
      return;
    }

    setLoading(true);

    const paymentData = {
      paymentNumber,
      paymentType,
      referenceId: selectedReference.id,
      referenceNumber:
        paymentType === "Invoice"
          ? selectedReference.invoiceNumber
          : selectedReference.purchaseNumber,
      partyName: selectedReference.partyName,
      totalAmount: selectedReference.totalAmount,
      paidAmount: selectedReference.paidAmount || 0,
      dueAmount: selectedReference.dueAmount || 0,
      paymentAmount: Number(paymentAmount),
      paymentMode,
      note,
    };

    const result = await paymentController.createPayment(paymentData);

    if (result.success) {
      alert("Payment added successfully!");
      setTimeout(() => {
        navigate("/admin/payments", { replace: true });
      }, 100);
    } else {
      alert("Error adding payment: " + result.error);
      setLoading(false);
    }
  };

  return (
    <div className="payment-add-screen">
      <button className="back-btn" onClick={() => navigate("/admin/payments")}>
        ← Back
      </button>

      <div className="header-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Saving..." : "Save Payment"}
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>Payment Number *</label>
              <input
                type="text"
                value={paymentNumber}
                readOnly
                className="readonly-input"
              />
            </div>

            <div className="form-group">
              <label>Payment Type *</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                required
              >
                <option value="Invoice">Invoice</option>
                <option value="Purchase">Purchase</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              Select {paymentType === "Invoice" ? "Invoice" : "Purchase"}{" "}
              <span className="required">*</span>
            </label>
            <select
              value={selectedReference?.id || ""}
              onChange={(e) => handleReferenceSelect(e.target.value)}
              required
            >
              <option value="">
                -- Select {paymentType === "Invoice" ? "Invoice" : "Purchase"}{" "}
                --
              </option>
              {references.map((ref) => (
                <option key={ref.id} value={ref.id}>
                  {paymentType === "Invoice"
                    ? ref.invoiceNumber
                    : ref.purchaseNumber}{" "}
                  - {ref.partyName} - Due: ₹
                  {Number(ref.dueAmount || 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {selectedReference && (
            <div className="reference-details">
              <h3>Payment Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Party Name:</span>
                  <span className="detail-value">
                    {selectedReference.partyName}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">
                    ₹{Number(selectedReference.totalAmount).toFixed(2)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Paid Amount:</span>
                  <span className="detail-value">
                    ₹{Number(selectedReference.paidAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Due Amount:</span>
                  <span className="detail-value highlight">
                    ₹{Number(selectedReference.dueAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Status:</span>
                  <span
                    className={`status-badge ${selectedReference.paymentStatus?.toLowerCase().replace(" ", "-")}`}
                  >
                    {selectedReference.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Payment Amount *</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
                step="0.01"
                min="0"
                max={selectedReference?.dueAmount || 0}
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                required
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {selectedReference && paymentAmount > 0 && (
            <div className="payment-summary">
              <h4>After Payment:</h4>
              <div className="summary-item">
                <span>New Paid Amount:</span>
                <span className="summary-value">
                  ₹
                  {(
                    Number(selectedReference.paidAmount || 0) +
                    Number(paymentAmount)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span>Remaining Due:</span>
                <span className="summary-value">
                  ₹
                  {(
                    Number(selectedReference.dueAmount || 0) -
                    Number(paymentAmount)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span>New Status:</span>
                <span
                  className={`status-badge ${
                    Number(selectedReference.dueAmount || 0) -
                      Number(paymentAmount) <=
                    0
                      ? "paid"
                      : "partially-paid"
                  }`}
                >
                  {Number(selectedReference.dueAmount || 0) -
                    Number(paymentAmount) <=
                  0
                    ? "Paid"
                    : "Partially Paid"}
                </span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes (optional)"
              rows="3"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentAddScreen;
