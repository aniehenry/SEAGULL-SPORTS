import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import invoiceController from "../controllers/invoiceController";
import invoiceService from "../services/invoiceService";
import partyService from "../../party/services/partyService";
import itemService from "../../item/services/itemService";
import "./InvoiceAddScreen.css";

const InvoiceAddScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [parties, setParties] = useState([]);
  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    partyId: "",
    partyName: "",
    partyType: "Customer",
    items: [],
    discount: "",
    addCharges: "",
    paidAmount: "",
    roundOff: "",
    note: "",
  });

  const [errors] = useState({});

  const fetchPartiesAndItems = async () => {
    try {
      const [partiesData, itemsData] = await Promise.all([
        partyService.getAllParties(),
        itemService.getAllItems(),
      ]);
      setParties(partiesData);
      setItems(itemsData);

      // Generate invoice number for new invoices
      if (!isEditMode) {
        const invoiceNumber = await invoiceService.generateInvoiceNumber();
        setFormData((prev) => ({ ...prev, invoiceNumber }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchInvoice = async () => {
    try {
      const invoice = await invoiceService.getInvoiceById(id);
      if (invoice) {
        setFormData({
          invoiceNumber: invoice.invoiceNumber,
          partyId: invoice.partyId,
          partyName: invoice.partyName,
          partyType: invoice.partyType,
          items: invoice.items,
          discount: invoice.discount,
          addCharges: invoice.addCharges,
          paidAmount: invoice.paidAmount,
          roundOff: invoice.roundOff,
          note: invoice.note,
        });
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  useEffect(() => {
    fetchPartiesAndItems();
    if (isEditMode) {
      fetchInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const handlePartyChange = (e) => {
    const partyId = e.target.value;
    const party = parties.find((p) => p.id === partyId);
    setFormData({
      ...formData,
      partyId: partyId,
      partyName: party ? party.name : "",
      partyType: party ? party.partyType : "Customer",
    });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemId: "",
          itemName: "",
          quantity: 1,
          purchasePrice: 0,
          sellingPrice: 0,
          gstPercentage: 0,
          amount: 0,
        },
      ],
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItemRow = (index, field, value) => {
    const newItems = [...formData.items];

    if (field === "itemId") {
      const item = items.find((i) => i.id === value);
      if (item) {
        newItems[index] = {
          ...newItems[index],
          itemId: value,
          itemName: item.name,
          purchasePrice: item.purchasePrice || 0,
          sellingPrice: item.sellingPrice || 0,
          gstPercentage: item.gstPercentage || 0,
          quantity: newItems[index].quantity || 1,
        };
        // Calculate amount
        const qty = newItems[index].quantity;
        const price = item.sellingPrice;
        const gst = item.gstPercentage;
        newItems[index].amount = qty * price + (qty * price * gst) / 100;
      }
    } else if (field === "quantity") {
      newItems[index][field] = value;
      // Recalculate amount
      const qty = value;
      const price = newItems[index].sellingPrice;
      const gst = newItems[index].gstPercentage;
      newItems[index].amount = qty * price + (qty * price * gst) / 100;
    } else {
      newItems[index][field] = value;
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.sellingPrice || 0),
      0,
    );
  };

  const calculateTotalGST = () => {
    return formData.items.reduce(
      (sum, item) =>
        sum +
        ((item.quantity || 0) *
          (item.sellingPrice || 0) *
          (item.gstPercentage || 0)) /
          100,
      0,
    );
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (Number(formData.discount) || 0)) / 100;
  };

  const calculateTotalAmount = () => {
    const subtotal = calculateSubtotal();
    const gst = calculateTotalGST();
    const discount = calculateDiscountAmount();
    const addCharges = Number(formData.addCharges) || 0;
    const roundOff = Number(formData.roundOff) || 0;
    return subtotal + gst - discount + addCharges + roundOff;
  };

  const calculateDueAmount = () => {
    const total = calculateTotalAmount();
    const paid = Number(formData.paidAmount) || 0;
    return total - paid;
  };

  const getPaymentStatus = () => {
    const total = calculateTotalAmount();
    const paid = Number(formData.paidAmount) || 0;
    if (paid === 0) return "Unpaid";
    if (paid >= total) return "Paid";
    return "Partially Paid";
  };

  const handleSubmit = async () => {
    if (formData.items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    if (!formData.partyId) {
      alert("Please select a party");
      return;
    }

    const invoiceData = {
      ...formData,
      subtotal: calculateSubtotal(),
      discountAmount: calculateDiscountAmount(),
      totalAmount: calculateTotalAmount(),
      dueAmount: calculateDueAmount(),
      paymentStatus: getPaymentStatus(),
    };

    try {
      if (isEditMode) {
        const result = await invoiceController.updateInvoice(id, invoiceData);
        if (result.success) {
          alert("Invoice updated successfully!");
          navigate("/admin/invoices");
        } else {
          alert(result.error || "Failed to update invoice");
        }
      } else {
        const result = await invoiceController.createInvoice(invoiceData);
        if (result.success) {
          alert("Invoice created successfully!");
          navigate("/admin/invoices");
        } else {
          alert(result.error || "Failed to create invoice");
        }
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("An error occurred while saving the invoice");
    }
  };

  return (
    <div className="invoice-add-screen">
      <button className="back-btn" onClick={() => navigate("/admin/invoices")}>
        ← {isEditMode ? "Edit Invoice" : "Create Invoice"}
      </button>

      <div className="header-actions">
        <button type="button" className="btn-primary" onClick={handleSubmit}>
          Save
        </button>
      </div>

      <div className="form-container">
        <div className="invoice-form">
          {/* Invoice Header */}
          <div className="section-header">Invoice Details</div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="invoiceNumber">
                Invoice Number<span className="required">*</span>
              </label>
              <input
                type="text"
                id="invoiceNumber"
                value={formData.invoiceNumber}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="partyId">
                Select Party<span className="required">*</span>
              </label>
              <select
                id="partyId"
                value={formData.partyId}
                onChange={handlePartyChange}
                className={errors.partyId ? "error" : ""}
              >
                <option value="">Select a party</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name} - {party.partyType}
                  </option>
                ))}
              </select>
              {errors.partyId && (
                <span className="error-text">{errors.partyId}</span>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div className="section-header">
            Items
            <button type="button" className="btn-add-item" onClick={addItemRow}>
              + Add Item
            </button>
          </div>

          <div className="items-container">
            {formData.items.length === 0 ? (
              <div className="no-items">
                No items added. Click "+ Add Item" to add items.
              </div>
            ) : (
              <div className="items-table">
                <div className="items-table-header">
                  <div className="col-item">Item</div>
                  <div className="col-qty">Qty</div>
                  <div className="col-price">Price</div>
                  <div className="col-gst">GST %</div>
                  <div className="col-amount">Amount</div>
                  <div className="col-action">Action</div>
                </div>
                {formData.items.map((item, index) => {
                  const selectedItem = items.find((i) => i.id === item.itemId);
                  const availableStock = selectedItem?.stockQuantity || 0;
                  const isLowStock = item.quantity > availableStock;

                  return (
                    <div key={index} className="items-table-row">
                      <div className="col-item">
                        <select
                          value={item.itemId}
                          onChange={(e) =>
                            updateItemRow(index, "itemId", e.target.value)
                          }
                        >
                          <option value="">Select item</option>
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name} (Stock: {i.stockQuantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-qty">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemRow(index, "quantity", e.target.value)
                          }
                          min="1"
                          max={availableStock}
                          className={isLowStock ? "error" : ""}
                          title={
                            isLowStock
                              ? `Only ${availableStock} available in stock`
                              : ""
                          }
                        />
                        {isLowStock && (
                          <span
                            className="stock-warning"
                            style={{
                              color: "red",
                              fontSize: "11px",
                              display: "block",
                            }}
                          >
                            Only {availableStock} available
                          </span>
                        )}
                      </div>
                      <div className="col-price">
                        ₹{item.sellingPrice.toFixed(2)}
                      </div>
                      <div className="col-gst">{item.gstPercentage}%</div>
                      <div className="col-amount">
                        ₹{item.amount.toFixed(2)}
                      </div>
                      <div className="col-action">
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeItemRow(index)}
                          title="Delete item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Additional Charges Section */}
          <div className="additional-section">
            <div className="additional-fields">
              <div className="form-group">
                <label htmlFor="discount">
                  Discount % <span className="optional">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="discount"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="addCharges">
                  Additional Charges{" "}
                  <span className="optional">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="addCharges"
                  value={formData.addCharges}
                  onChange={(e) =>
                    setFormData({ ...formData, addCharges: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="roundOff">
                  Round Off <span className="optional">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="roundOff"
                  value={formData.roundOff}
                  onChange={(e) =>
                    setFormData({ ...formData, roundOff: e.target.value })
                  }
                  placeholder="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="paidAmount">
                  Paid Amount <span className="optional">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="paidAmount"
                  value={formData.paidAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, paidAmount: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className="invoice-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>GST:</span>
                <span>₹{calculateTotalGST().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Discount:</span>
                <span>-₹{calculateDiscountAmount().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Additional Charges:</span>
                <span>₹{(Number(formData.addCharges) || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Round Off:</span>
                <span>₹{(Number(formData.roundOff) || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{calculateTotalAmount().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Paid Amount:</span>
                <span>₹{(Number(formData.paidAmount) || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row due">
                <span>Due Amount:</span>
                <span>₹{calculateDueAmount().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="form-group">
            <label htmlFor="note">
              Note <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Add any additional notes here..."
              rows="3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceAddScreen;
