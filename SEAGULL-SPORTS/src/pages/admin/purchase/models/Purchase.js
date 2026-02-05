class Purchase {
  constructor(data = {}) {
    this.id = data.id || null;
    this.purchaseNumber = data.purchaseNumber || "";
    this.partyId = data.partyId || "";
    this.partyName = data.partyName || "";
    this.partyType = data.partyType || "Supplier";
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.discount = data.discount || 0;
    this.discountAmount = data.discountAmount || 0;
    this.addCharges = data.addCharges || 0;
    this.roundOff = data.roundOff || 0;
    this.totalAmount = data.totalAmount || 0;
    this.paidAmount = data.paidAmount || 0;
    this.dueAmount = data.dueAmount || 0;
    this.paymentStatus = data.paymentStatus || "Unpaid";
    this.note = data.note || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = {};

    if (!this.purchaseNumber || this.purchaseNumber.trim() === "") {
      errors.purchaseNumber = "Purchase number is required";
    }

    if (!this.partyId || this.partyId.trim() === "") {
      errors.partyId = "Party is required";
    }

    if (!this.items || this.items.length === 0) {
      errors.items = "At least one item is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      purchaseNumber: this.purchaseNumber,
      partyId: this.partyId,
      partyName: this.partyName,
      partyType: this.partyType,
      items: this.items,
      subtotal: this.subtotal,
      discount: this.discount,
      discountAmount: this.discountAmount,
      addCharges: this.addCharges,
      roundOff: this.roundOff,
      totalAmount: this.totalAmount,
      paidAmount: this.paidAmount,
      dueAmount: this.dueAmount,
      paymentStatus: this.paymentStatus,
      note: this.note,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Purchase({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    });
  }
}

export default Purchase;
