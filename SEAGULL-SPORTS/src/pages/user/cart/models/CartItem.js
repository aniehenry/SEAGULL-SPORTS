class CartItem {
  constructor(data = {}) {
    this.id = data.id || null;
    this.productId = data.productId || null;
    this.name = data.name || "";
    this.price = data.price || 0;
    this.quantity = data.quantity || 1;
    this.image = data.image || "";
    this.maxStock = data.maxStock || 0;
    this.addedAt = data.addedAt || new Date();
  }

  getTotalPrice() {
    return this.price * this.quantity;
  }

  canIncreaseQuantity() {
    return this.quantity < this.maxStock;
  }

  toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      image: this.image,
      maxStock: this.maxStock,
      addedAt: this.addedAt,
    };
  }

  static fromJSON(data) {
    return new CartItem({
      ...data,
      addedAt: new Date(data.addedAt),
    });
  }
}

export default CartItem;