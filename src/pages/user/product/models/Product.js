class Product {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.category = data.category || "";
    this.stockQuantity = data.stockQuantity || 0;
    this.purchasePrice = data.purchasePrice || 0;
    this.sellingPrice = data.sellingPrice || 0;
    this.gstPercentage = data.gstPercentage || 0;
    this.description = data.description || "";
    this.images = data.images || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromFirestore(doc) {
    if (!doc.exists()) {
      throw new Error("Document does not exist");
    }

    const data = doc.data();
    return new Product({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }

  toFirestore() {
    return {
      name: this.name,
      category: this.category,
      stockQuantity: this.stockQuantity,
      purchasePrice: this.purchasePrice,
      sellingPrice: this.sellingPrice,
      gstPercentage: this.gstPercentage,
      description: this.description,
      images: this.images,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  getDisplayPrice() {
    return this.sellingPrice;
  }

  getDiscountedPrice() {
    // Can add discount logic here later
    return this.sellingPrice;
  }

  isInStock() {
    return this.stockQuantity > 0;
  }

  getMainImage() {
    return this.images && this.images.length > 0 
      ? this.images[0].url 
      : 'https://via.placeholder.com/300x300?text=No+Image';
  }
}

export default Product;