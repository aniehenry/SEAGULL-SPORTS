import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import purchaseController from "../controllers/purchaseController";
import purchaseService from "../services/purchaseService";
import partyService from "../../party/services/partyService";
import itemService from "../../item/services/itemService";
import "./PurchaseAddScreen.css";

const PurchaseAddScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [parties, setParties] = useState([]);
  const [items, setItems] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showStockView, setShowStockView] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: "",
    category: "",
    stockQuantity: 0,
    purchasePrice: "",
    sellingPrice: "",
    gstPercentage: "",
    description: "",
  });
  const [itemErrors, setItemErrors] = useState({});

  const [formData, setFormData] = useState({
    purchaseNumber: "",
    partyId: "",
    partyName: "",
    partyType: "Supplier",
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

      // Generate purchase number for new purchases
      if (!isEditMode) {
        const purchaseNumber = await purchaseService.generatePurchaseNumber();
        setFormData((prev) => ({ ...prev, purchaseNumber }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddNewItem = async () => {
    const newErrors = {};
    if (!newItemData.name.trim()) newErrors.name = "Item name is required";
    if (!newItemData.category.trim())
      newErrors.category = "Category is required";
    if (!newItemData.purchasePrice || Number(newItemData.purchasePrice) <= 0)
      newErrors.purchasePrice = "Purchase price must be greater than 0";
    if (!newItemData.sellingPrice || Number(newItemData.sellingPrice) <= 0)
      newErrors.sellingPrice = "Selling price must be greater than 0";
    if (
      newItemData.gstPercentage === "" ||
      Number(newItemData.gstPercentage) < 0
    )
      newErrors.gstPercentage = "GST percentage is required";

    if (Object.keys(newErrors).length > 0) {
      setItemErrors(newErrors);
      return;
    }

    try {
      const newItemId = await itemService.addItem({
        ...newItemData,
        stockQuantity: Number(newItemData.stockQuantity),
        purchasePrice: Number(newItemData.purchasePrice),
        sellingPrice: Number(newItemData.sellingPrice),
        gstPercentage: Number(newItemData.gstPercentage),
      });

      // Refresh items list
      await fetchPartiesAndItems();

      // Automatically add the new item to purchase
      const qty = 1;
      const price = Number(newItemData.purchasePrice);
      const gst = Number(newItemData.gstPercentage);
      const amount = qty * price + (qty * price * gst) / 100;

      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            itemId: newItemId,
            itemName: newItemData.name,
            quantity: qty,
            purchasePrice: price,
            sellingPrice: Number(newItemData.sellingPrice),
            gstPercentage: gst,
            amount: amount,
          },
        ],
      }));

      alert("Item added successfully and added to purchase!");
      setShowItemModal(false);
      setNewItemData({
        name: "",
        category: "",
        stockQuantity: 0,
        purchasePrice: "",
        sellingPrice: "",
        gstPercentage: "",
        description: "",
      });
      setItemErrors({});
    } catch (error) {
      alert("Failed to add item: " + error.message);
    }
  };

  const fetchPurchase = async () => {
    try {
      const purchase = await purchaseService.getPurchaseById(id);
      if (purchase) {
        setFormData({
          purchaseNumber: purchase.purchaseNumber,
          partyId: purchase.partyId,
          partyName: purchase.partyName,
          partyType: purchase.partyType,
          items: purchase.items,
          discount: purchase.discount,
          addCharges: purchase.addCharges,
          paidAmount: purchase.paidAmount,
          roundOff: purchase.roundOff,
          note: purchase.note,
        });
      }
    } catch (error) {
      console.error("Error fetching purchase:", error);
    }
  };

  useEffect(() => {
    fetchPartiesAndItems();
    if (isEditMode) {
      fetchPurchase();
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
      partyType: party ? party.partyType : "Supplier",
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
        const itemStockQty = item.stockQuantity || 0;
        newItems[index] = {
          ...newItems[index],
          itemId: value,
          itemName: item.name,
          purchasePrice: item.purchasePrice || 0,
          sellingPrice: item.sellingPrice || 0,
          gstPercentage: item.gstPercentage || 0,
          quantity: itemStockQty,
        };
        // Calculate amount based on purchase price
        const qty = itemStockQty;
        const price = item.purchasePrice;
        const gst = item.gstPercentage;
        newItems[index].amount = qty * price + (qty * price * gst) / 100;
      }
    } else if (field === "quantity") {
      newItems[index][field] = value;
      // Recalculate amount
      const qty = value;
      const price = newItems[index].purchasePrice;
      const gst = newItems[index].gstPercentage;
      newItems[index].amount = qty * price + (qty * price * gst) / 100;
    } else {
      newItems[index][field] = value;
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.purchasePrice || 0),
      0,
    );
  };

  const calculateTotalGST = () => {
    return formData.items.reduce(
      (sum, item) =>
        sum +
        ((item.quantity || 0) *
          (item.purchasePrice || 0) *
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

    const purchaseData = {
      ...formData,
      subtotal: calculateSubtotal(),
      discountAmount: calculateDiscountAmount(),
      totalAmount: calculateTotalAmount(),
      dueAmount: calculateDueAmount(),
      paymentStatus: getPaymentStatus(),
    };

    try {
      if (isEditMode) {
        const result = await purchaseController.updatePurchase(
          id,
          purchaseData,
        );
        if (result.success) {
          alert("Purchase updated successfully!");
          setTimeout(() => {
            navigate("/admin/purchases", { replace: true });
          }, 100);
        } else {
          alert(result.error || "Failed to update purchase");
        }
      } else {
        const result = await purchaseController.createPurchase(purchaseData);
        if (result.success) {
          alert("Purchase created successfully!");
          setTimeout(() => {
            navigate("/admin/purchases", { replace: true });
          }, 100);
        } else {
          alert(result.error || "Failed to create purchase");
        }
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      alert("An error occurred while saving the purchase: " + error.message);
    }
  };

  return (
    <div className="purchase-add-screen">
      <button className="back-btn" onClick={() => navigate("/admin/purchases")}>
        ← {isEditMode ? "Edit Purchase" : "Create Purchase"}
      </button>

      <div className="header-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowStockView(!showStockView)}
          style={{ background: "#10b981", color: "white", marginRight: "8px" }}
        >
          {showStockView ? "Hide" : "View"} Stock
        </button>
        <button type="button" className="btn-primary" onClick={handleSubmit}>
          Save
        </button>
      </div>

      <div className="form-container">
        <div className="purchase-form">
          {/* Purchase Header */}
          <div className="section-header">Purchase Details</div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="purchaseNumber">
                Purchase Number<span className="required">*</span>
              </label>
              <input
                type="text"
                id="purchaseNumber"
                value={formData.purchaseNumber}
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

          {/* Stock View Panel */}
          {showStockView && (
            <div className="stock-view-panel">
              <div className="section-header">Current Inventory Stock</div>
              <div className="stock-table-container">
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Stock Qty</th>
                      <th>Purchase Price</th>
                      <th>Selling Price</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "center",
                            padding: "20px",
                            color: "#999",
                          }}
                        >
                          No items in inventory
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => {
                        const totalValue =
                          (item.stockQuantity || 0) * (item.purchasePrice || 0);
                        return (
                          <tr key={item.id}>
                            <td style={{ fontWeight: "500" }}>{item.name}</td>
                            <td>{item.category}</td>
                            <td>
                              <span
                                className={`stock-badge ${item.stockQuantity < 10 ? "low-stock" : ""}`}
                              >
                                {item.stockQuantity}
                              </span>
                            </td>
                            <td>₹{(item.purchasePrice || 0).toFixed(2)}</td>
                            <td>₹{(item.sellingPrice || 0).toFixed(2)}</td>
                            <td style={{ fontWeight: "600" }}>
                              ₹{totalValue.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot>
                      <tr style={{ background: "#f9fafb", fontWeight: "700" }}>
                        <td colSpan="2">Total Inventory Value:</td>
                        <td>
                          {items.reduce(
                            (sum, item) => sum + (item.stockQuantity || 0),
                            0,
                          )}
                        </td>
                        <td colSpan="2"></td>
                        <td>
                          ₹
                          {items
                            .reduce(
                              (sum, item) =>
                                sum +
                                (item.stockQuantity || 0) *
                                  (item.purchasePrice || 0),
                              0,
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="section-header">
            Items
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="btn-add-item"
                onClick={() => setShowItemModal(true)}
                style={{ background: "#10b981" }}
              >
                + New Item
              </button>
              <button
                type="button"
                className="btn-add-item"
                onClick={addItemRow}
              >
                + Add Item
              </button>
            </div>
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
                  <div className="col-price">Purchase Price</div>
                  <div className="col-gst">GST %</div>
                  <div className="col-amount">Amount</div>
                  <div className="col-action">Action</div>
                </div>
                {formData.items.map((item, index) => {
                  const selectedItem = items.find((i) => i.id === item.itemId);
                  const currentStock = selectedItem?.stockQuantity || 0;

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
                        {selectedItem && (
                          <span
                            className="stock-info"
                            style={{
                              color: "#666",
                              fontSize: "11px",
                              display: "block",
                            }}
                          >
                            Current Stock: {currentStock}
                          </span>
                        )}
                      </div>
                      <div className="col-qty">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemRow(index, "quantity", e.target.value)
                          }
                          min="1"
                        />
                      </div>
                      <div className="col-price">
                        ₹{item.purchasePrice.toFixed(2)}
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
            <div className="purchase-summary">
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

      {/* Add New Item Modal */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Item</h3>
              <button
                className="close-btn"
                onClick={() => setShowItemModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label>
                    Item Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={newItemData.name}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, name: e.target.value })
                    }
                    className={itemErrors.name ? "error" : ""}
                  />
                  {itemErrors.name && (
                    <span className="error-text">{itemErrors.name}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Category<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={newItemData.category}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        category: e.target.value,
                      })
                    }
                    className={itemErrors.category ? "error" : ""}
                  />
                  {itemErrors.category && (
                    <span className="error-text">{itemErrors.category}</span>
                  )}
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    value={newItemData.stockQuantity}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        stockQuantity: e.target.value,
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>
                    GST %<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={newItemData.gstPercentage}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        gstPercentage: e.target.value,
                      })
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    className={itemErrors.gstPercentage ? "error" : ""}
                  />
                  {itemErrors.gstPercentage && (
                    <span className="error-text">
                      {itemErrors.gstPercentage}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>
                    Purchase Price<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={newItemData.purchasePrice}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        purchasePrice: e.target.value,
                      })
                    }
                    min="0"
                    step="0.01"
                    className={itemErrors.purchasePrice ? "error" : ""}
                  />
                  {itemErrors.purchasePrice && (
                    <span className="error-text">
                      {itemErrors.purchasePrice}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Selling Price<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={newItemData.sellingPrice}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        sellingPrice: e.target.value,
                      })
                    }
                    min="0"
                    step="0.01"
                    className={itemErrors.sellingPrice ? "error" : ""}
                  />
                  {itemErrors.sellingPrice && (
                    <span className="error-text">
                      {itemErrors.sellingPrice}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>
                  Description<span className="optional">(Optional)</span>
                </label>
                <textarea
                  value={newItemData.description}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowItemModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddNewItem}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseAddScreen;
