class Order {
  constructor(
    orderId = "",
    orderNumber = "",
    customerName = "",
    customerPhone = "",
    customerEmail = "",
    items = [],
    totalAmount = 0,
    orderDate = new Date(),
    status = "Pending",
    paymentStatus = "Unpaid",
    deliveryAddress = "",
    notes = "",
  ) {
    this.orderId = orderId;
    this.orderNumber = orderNumber;
    this.customerName = customerName;
    this.customerPhone = customerPhone;
    this.customerEmail = customerEmail;
    this.items = items; // Array of {itemId, itemName, quantity, price, total}
    this.totalAmount = totalAmount;
    this.orderDate = orderDate;
    this.status = status; // Pending, Processing, Completed, Cancelled
    this.paymentStatus = paymentStatus; // Unpaid, Paid, Partially Paid
    this.deliveryAddress = deliveryAddress;
    this.notes = notes;
  }

  static validate(order) {
    const errors = [];

    if (!order.orderNumber || order.orderNumber.trim() === "") {
      errors.push("Order number is required");
    }

    if (!order.customerName || order.customerName.trim() === "") {
      errors.push("Customer name is required");
    }

    if (!order.customerPhone || order.customerPhone.trim() === "") {
      errors.push("Customer phone is required");
    }

    if (!order.items || order.items.length === 0) {
      errors.push("At least one item is required");
    }

    if (!order.totalAmount || order.totalAmount <= 0) {
      errors.push("Total amount must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      orderId: this.orderId,
      orderNumber: this.orderNumber,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      items: this.items,
      totalAmount: this.totalAmount,
      orderDate: this.orderDate,
      status: this.status,
      paymentStatus: this.paymentStatus,
      deliveryAddress: this.deliveryAddress,
      notes: this.notes,
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Order(
      doc.id,
      data.orderNumber,
      data.customerName,
      data.customerPhone,
      data.customerEmail,
      data.items || [],
      data.totalAmount,
      data.orderDate?.toDate() || new Date(),
      data.status,
      data.paymentStatus,
      data.deliveryAddress,
      data.notes,
    );
  }
}

export default Order;
