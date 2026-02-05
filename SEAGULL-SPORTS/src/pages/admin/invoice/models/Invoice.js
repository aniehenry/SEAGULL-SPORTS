class Invoice {
  constructor(data = {}) {
    this.id = data.id || null;
    this.invoiceNumber = data.invoiceNumber || "";
    this.partyId = data.partyId || "";
    this.partyName = data.partyName || "";
    this.partyType = data.partyType || "Customer";
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.discount = data.discount || 0;
    this.discountAmount = data.discountAmount || 0;
    this.addCharges = data.addCharges || 0;
    this.roundOff = data.roundOff || 0;
    this.totalAmount = data.totalAmount || 0;
    this.paidAmount = data.paidAmount || 0;
    this.dueAmount = data.dueAmount || 0;
    this.paymentStatus = data.paymentStatus || "Unpaid"; // Paid, Unpaid, Partially Paid
    this.note = data.note || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = {};

    if (!this.partyId || this.partyId.trim() === "") {
      errors.partyId = "Party is required";
    }

    if (!this.items || this.items.length === 0) {
      errors.items = "At least one item is required";
    }

    if (this.paidAmount < 0) {
      errors.paidAmount = "Paid amount cannot be negative";
    }

    if (this.paidAmount > this.totalAmount) {
      errors.paidAmount = "Paid amount cannot exceed total amount";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      invoiceNumber: this.invoiceNumber,
      partyId: this.partyId,
      partyName: this.partyName,
      partyType: this.partyType,
      items: this.items,
      subtotal: Number(this.subtotal),
      discount: Number(this.discount),
      discountAmount: Number(this.discountAmount),
      addCharges: Number(this.addCharges),
      roundOff: Number(this.roundOff),
      totalAmount: Number(this.totalAmount),
      paidAmount: Number(this.paidAmount),
      dueAmount: Number(this.dueAmount),
      paymentStatus: this.paymentStatus,
      note: this.note,
      updatedAt: new Date(),
      ...(this.createdAt ? {} : { createdAt: new Date() }),
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Invoice({
      id: doc.id,
      ...data,
    });
  }
}

export default Invoice;
