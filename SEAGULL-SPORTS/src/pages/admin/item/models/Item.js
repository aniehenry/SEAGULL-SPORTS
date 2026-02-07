class Item {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.category = data.category || "";
    this.brand = data.brand || "";
    this.size = data.size || "";
    this.color = data.color || "";
    this.material = data.material || "";
    this.weight = data.weight || "";
    this.stockQuantity = data.stockQuantity || 0;
    this.purchasePrice = data.purchasePrice || 0;
    this.sellingPrice = data.sellingPrice || 0;
    this.gstPercentage = data.gstPercentage || 0;
    this.description = data.description || "";
    this.images = data.images || []; // Array of image objects with url, public_id, originalName
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = {};

    if (!this.name || this.name.trim() === "") {
      errors.name = "Item name is required";
    }

    if (!this.category || this.category.trim() === "") {
      errors.category = "Category is required";
    }

    if (this.stockQuantity === "" || this.stockQuantity < 0) {
      errors.stockQuantity = "Stock quantity must be 0 or greater";
    }

    if (!this.purchasePrice || this.purchasePrice <= 0) {
      errors.purchasePrice = "Purchase price must be greater than 0";
    }

    if (!this.sellingPrice || this.sellingPrice <= 0) {
      errors.sellingPrice = "Selling price must be greater than 0";
    }

    if (
      this.gstPercentage === "" ||
      this.gstPercentage < 0 ||
      this.gstPercentage > 100
    ) {
      errors.gstPercentage = "GST percentage must be between 0 and 100";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      name: this.name,
      category: this.category,
      stockQuantity: Number(this.stockQuantity),
      purchasePrice: Number(this.purchasePrice),
      sellingPrice: Number(this.sellingPrice),
      gstPercentage: Number(this.gstPercentage),
      description: this.description,
      images: this.images || [], // Include images array
      updatedAt: new Date(),
      ...(this.createdAt ? {} : { createdAt: new Date() }),
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Item({
      id: doc.id,
      ...data,
    });
  }
}

export default Item;
