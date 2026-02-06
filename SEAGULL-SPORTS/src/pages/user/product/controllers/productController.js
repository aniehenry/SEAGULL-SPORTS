import productService from "../services/productService";
import Product from "../models/Product";

class ProductController {
  // Create new product
  async createProduct(productData) {
    try {
      const result = await productService.createProduct(productData);
      return result;
    } catch (error) {
      console.error("Controller - Error creating product:", error);
      return {
        success: false,
        error: "Failed to create product. Please try again.",
      };
    }
  }

  // Update existing product
  async updateProduct(id, productData) {
    try {
      const result = await productService.updateProduct(id, productData);
      return result;
    } catch (error) {
      console.error("Controller - Error updating product:", error);
      return {
        success: false,
        error: "Failed to update product. Please try again.",
      };
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const result = await productService.deleteProduct(id);
      return result;
    } catch (error) {
      console.error("Controller - Error deleting product:", error);
      return {
        success: false,
        error: "Failed to delete product. Please try again.",
      };
    }
  }

  // Get single product
  async getProduct(id) {
    try {
      const result = await productService.getProductById(id);
      return result;
    } catch (error) {
      console.error("Controller - Error fetching product:", error);
      return {
        success: false,
        error: "Failed to fetch product. Please try again.",
      };
    }
  }

  // Get all products with filters
  async getProducts(filters = {}) {
    try {
      const result = await productService.getProducts(filters);
      return result;
    } catch (error) {
      console.error("Controller - Error fetching products:", error);
      return {
        success: false,
        error: "Failed to fetch products. Please try again.",
      };
    }
  }

  // Search products
  async searchProducts(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return {
          success: false,
          error: "Search term must be at least 2 characters long.",
        };
      }

      const result = await productService.searchProducts(searchTerm.trim());
      return result;
    } catch (error) {
      console.error("Controller - Error searching products:", error);
      return {
        success: false,
        error: "Failed to search products. Please try again.",
      };
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const result = await productService.getProductsByCategory(category);
      return result;
    } catch (error) {
      console.error("Controller - Error fetching products by category:", error);
      return {
        success: false,
        error: "Failed to fetch products by category. Please try again.",
      };
    }
  }

  // Get featured products
  async getFeaturedProducts(limit = 10) {
    try {
      const result = await productService.getFeaturedProducts(limit);
      return result;
    } catch (error) {
      console.error("Controller - Error fetching featured products:", error);
      return {
        success: false,
        error: "Failed to fetch featured products. Please try again.",
      };
    }
  }

  // Update product stock
  async updateStock(id, newStock) {
    try {
      if (newStock < 0) {
        return {
          success: false,
          error: "Stock quantity cannot be negative.",
        };
      }

      const result = await productService.updateStock(id, newStock);
      return result;
    } catch (error) {
      console.error("Controller - Error updating stock:", error);
      return {
        success: false,
        error: "Failed to update stock. Please try again.",
      };
    }
  }

  // Bulk operations
  async bulkUpdateStatus(productIds, newStatus) {
    try {
      const validStatuses = ["active", "inactive", "out_of_stock"];
      if (!validStatuses.includes(newStatus)) {
        return {
          success: false,
          error: "Invalid status provided.",
        };
      }

      const results = await Promise.all(
        productIds.map(async (id) => {
          try {
            const product = await productService.getProductById(id);
            if (product.success) {
              const updatedData = {
                ...product.data.toJSON(),
                status: newStatus,
              };
              return await productService.updateProduct(id, updatedData);
            }
            return { success: false, error: "Product not found", id };
          } catch (error) {
            return { success: false, error: error.message, id };
          }
        }),
      );

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      return {
        success: failed === 0,
        message: `${successful} products updated successfully${failed > 0 ? `, ${failed} failed` : ""}`,
        results,
      };
    } catch (error) {
      console.error("Controller - Error in bulk update:", error);
      return {
        success: false,
        error: "Failed to update products. Please try again.",
      };
    }
  }

  // Get product statistics
  async getProductStats() {
    try {
      const allProducts = await productService.getProducts();

      if (!allProducts.success) {
        return allProducts;
      }

      const products = allProducts.data;

      const stats = {
        total: products.length,
        active: products.filter((p) => p.status === "active").length,
        inactive: products.filter((p) => p.status === "inactive").length,
        outOfStock: products.filter((p) => p.stockQuantity === 0).length,
        lowStock: products.filter(
          (p) => p.stockQuantity <= 10 && p.stockQuantity > 0,
        ).length,
        categories: {},
        brands: {},
        totalValue: 0,
      };

      // Calculate category and brand distribution
      products.forEach((product) => {
        // Categories
        if (stats.categories[product.category]) {
          stats.categories[product.category]++;
        } else {
          stats.categories[product.category] = 1;
        }

        // Brands
        if (stats.brands[product.brand]) {
          stats.brands[product.brand]++;
        } else {
          stats.brands[product.brand] = 1;
        }

        // Total inventory value
        stats.totalValue += product.price * product.stockQuantity;
      });

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Controller - Error fetching product stats:", error);
      return {
        success: false,
        error: "Failed to fetch product statistics. Please try again.",
      };
    }
  }

  // Validate product data
  validateProductData(productData) {
    const product = new Product(productData);
    return product.validate();
  }
}

const productController = new ProductController();
export default productController;
