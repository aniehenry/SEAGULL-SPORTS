class Payment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.paymentNumber = data.paymentNumber || "";
    this.paymentType = data.paymentType || "Invoice"; // Invoice or Purchase
    this.referenceId = data.referenceId || ""; // Invoice ID or Purchase ID
    this.referenceNumber = data.referenceNumber || ""; // Invoice Number or Purchase Number
    this.partyName = data.partyName || "";
    this.totalAmount = data.totalAmount || 0;
    this.paidAmount = data.paidAmount || 0;
    this.dueAmount = data.dueAmount || 0;
    this.paymentAmount = data.paymentAmount || 0;
    this.paymentMode = data.paymentMode || "Cash"; // Cash, UPI, Bank Transfer, Card
    this.note = data.note || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = {};

    if (!this.paymentNumber || this.paymentNumber.trim() === "") {
      errors.paymentNumber = "Payment number is required";
    }

    if (!this.referenceId || this.referenceId.trim() === "") {
      errors.referenceId = "Please select an invoice or purchase";
    }

    if (!this.paymentAmount || this.paymentAmount <= 0) {
      errors.paymentAmount = "Payment amount must be greater than 0";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      paymentNumber: this.paymentNumber,
      paymentType: this.paymentType,
      referenceId: this.referenceId,
      referenceNumber: this.referenceNumber,
      partyName: this.partyName,
      totalAmount: this.totalAmount,
      paidAmount: this.paidAmount,
      dueAmount: this.dueAmount,
      paymentAmount: this.paymentAmount,
      paymentMode: this.paymentMode,
      note: this.note,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Payment({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    });
  }
}

export default Payment;
