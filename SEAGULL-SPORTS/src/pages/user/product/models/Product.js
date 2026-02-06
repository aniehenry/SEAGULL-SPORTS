class Product {
  constructor({
    id = null,
    name = "",
    category = "",
    description = "",
    price = 0,
    discountPrice = 0,
    stockQuantity = 0,
    images = [],
    brand = "",
    features = [],
    specifications = {},
    status = "active", // active, inactive, out_of_stock
    rating = 0,
    reviewsCount = 0,
    createdAt = null,
    updatedAt = null,
  } = {}) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.description = description;
    this.price = price;
    this.discountPrice = discountPrice;
    this.stockQuantity = stockQuantity;
    this.images = images;
    this.brand = brand;
    this.features = features;
    this.specifications = specifications;
    this.status = status;
    this.rating = rating;
    this.reviewsCount = reviewsCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Calculate discount percentage
  getDiscountPercentage() {
    if (this.price > 0 && this.discountPrice > 0) {
      return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
  }

  // Get final selling price
  getFinalPrice() {
    return this.discountPrice > 0 ? this.discountPrice : this.price;
  }

  // Check if product is in stock
  isInStock() {
    return this.stockQuantity > 0;
  }

  // Get stock status
  getStockStatus() {
    if (this.stockQuantity === 0) return "Out of Stock";
    if (this.stockQuantity <= 10) return "Low Stock";
    return "In Stock";
  }

  // Validate product data
  validate() {
    const errors = {};

    if (!this.name.trim()) {
      errors.name = "Product name is required";
    }

    if (!this.category.trim()) {
      errors.category = "Category is required";
    }

    if (!this.brand.trim()) {
      errors.brand = "Brand is required";
    }

    if (this.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (this.discountPrice < 0) {
      errors.discountPrice = "Discount price cannot be negative";
    }

    if (this.discountPrice >= this.price) {
      errors.discountPrice = "Discount price must be less than original price";
    }

    if (this.stockQuantity < 0) {
      errors.stockQuantity = "Stock quantity cannot be negative";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Convert to plain object for API
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      price: this.price,
      discountPrice: this.discountPrice,
      stockQuantity: this.stockQuantity,
      images: this.images,
      brand: this.brand,
      features: this.features,
      specifications: this.specifications,
      status: this.status,
      rating: this.rating,
      reviewsCount: this.reviewsCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new Product(data);
  }
}

export default Product;
