class Order {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.orderNumber = data.orderNumber || this.generateOrderNumber();
    this.items = data.items || [];
    
    // Calculate totals if not provided
    if (data.subtotal !== undefined) {
      this.subtotal = Number(data.subtotal) || 0;
    } else {
      this.subtotal = this.calculateSubtotal();
    }
    
    this.tax = Number(data.tax) || 0;
    
    if (data.total !== undefined) {
      this.total = Number(data.total) || 0;
    } else {
      this.total = this.subtotal + this.tax;
    }
    
    this.status = data.status || 'pending';
    this.paymentStatus = data.paymentStatus || 'pending';
    this.orderDate = data.orderDate || new Date();
    this.deliveryAddress = data.deliveryAddress || null;
    this.customerNotes = data.customerNotes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  calculateSubtotal() {
    return this.items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
  }

  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  // Convert to plain object for Firestore
  toFirestore() {
    // Ensure all required fields are present and not undefined
    return {
      orderNumber: this.orderNumber || this.generateOrderNumber(),
      userId: this.userId || null,
      items: (this.items || []).map(item => ({
        id: item.id || '',
        name: item.name || '',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || '',
        category: item.category || 'general',
        adminId: item.adminId || '',
        total: (Number(item.price) || 0) * (Number(item.quantity) || 1)
      })),
      subtotal: Number(this.subtotal) || 0,
      tax: Number(this.tax) || 0,
      total: Number(this.total) || 0,
      status: this.status || 'pending',
      paymentStatus: this.paymentStatus || 'pending',
      orderDate: this.orderDate instanceof Date ? this.orderDate : new Date(),
      deliveryAddress: this.deliveryAddress || null,
      customerNotes: this.customerNotes || '',
      createdAt: this.createdAt instanceof Date ? this.createdAt : new Date(),
      updatedAt: this.updatedAt instanceof Date ? this.updatedAt : new Date()
    };
  }

  // Create from Firestore document
  static fromFirestore(doc) {
    if (!doc.exists()) {
      throw new Error("Document does not exist");
    }

    const data = doc.data();
    return new Order({
      id: doc.id,
      ...data,
      orderDate: data.orderDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    });
  }

  // Calculate totals
  calculateTotals() {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.tax = this.subtotal * 0.18; // 18% GST
    this.total = this.subtotal + this.tax;
  }

  // Validate order
  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push("User ID is required");
    }

    if (!this.items || this.items.length === 0) {
      errors.push("Order must contain at least one item");
    }

    if (this.total <= 0) {
      errors.push("Order total must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Update status
  updateStatus(status) {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    this.status = status;
    this.updatedAt = new Date();
  }

  // Update payment status
  updatePaymentStatus(paymentStatus) {
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new Error(`Invalid payment status: ${paymentStatus}`);
    }
    
    this.paymentStatus = paymentStatus;
    this.updatedAt = new Date();
  }

  // Get formatted order date
  getFormattedDate() {
    return this.orderDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get total items count
  getTotalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Get formatted price
  getFormattedPrice(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Get status badge color
  getStatusBadgeColor() {
    const statusColors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return statusColors[this.status] || '#6b7280';
  }
}

export default Order;