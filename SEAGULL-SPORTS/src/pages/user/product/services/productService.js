import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../firebasecongif";
import Product from "../models/Product";

class ProductService {
  constructor() {
    this.collectionName = "products";
    this.collection = collection(db, this.collectionName);
  }

  // Create a new product
  async createProduct(productData) {
    try {
      const product = new Product({
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const validation = product.validate();
      if (!validation.isValid) {
        return {
          success: false,
          error: "Validation failed",
          validationErrors: validation.errors,
        };
      }

      const docRef = await addDoc(this.collection, product.toJSON());

      return {
        success: true,
        data: { ...product.toJSON(), id: docRef.id },
        message: "Product created successfully",
      };
    } catch (error) {
      console.error("Error creating product:", error);
      return {
        success: false,
        error: error.message || "Failed to create product",
      };
    }
  }

  // Update existing product
  async updateProduct(id, productData) {
    try {
      const product = new Product({
        ...productData,
        id,
        updatedAt: serverTimestamp(),
      });

      const validation = product.validate();
      if (!validation.isValid) {
        return {
          success: false,
          error: "Validation failed",
          validationErrors: validation.errors,
        };
      }

      const productRef = doc(db, this.collectionName, id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      await updateDoc(productRef, product.toJSON());

      return {
        success: true,
        data: product.toJSON(),
        message: "Product updated successfully",
      };
    } catch (error) {
      console.error("Error updating product:", error);
      return {
        success: false,
        error: error.message || "Failed to update product",
      };
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const productRef = doc(db, this.collectionName, id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      await deleteDoc(productRef);

      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      return {
        success: false,
        error: error.message || "Failed to delete product",
      };
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const productRef = doc(db, this.collectionName, id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      const productData = { id: productDoc.id, ...productDoc.data() };
      const product = Product.fromJSON(productData);

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch product",
      };
    }
  }

  // Get all products with optional filters
  async getProducts(filters = {}) {
    try {
      let q = query(this.collection);

      // Apply filters
      if (filters.category) {
        q = query(q, where("category", "==", filters.category));
      }

      if (filters.status) {
        q = query(q, where("status", "==", filters.status));
      }

      if (filters.brand) {
        q = query(q, where("brand", "==", filters.brand));
      }

      // Apply ordering
      const orderField = filters.orderBy || "createdAt";
      const orderDirection = filters.orderDirection || "desc";
      q = query(q, orderBy(orderField, orderDirection));

      // Apply pagination
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      if (filters.startAfter) {
        q = query(q, startAfter(filters.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        const productData = { id: doc.id, ...doc.data() };
        const product = Product.fromJSON(productData);
        products.push(product);
      });

      return {
        success: true,
        data: products,
        count: products.length,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch products",
      };
    }
  }

  // Search products by name
  async searchProducts(searchTerm) {
    try {
      const querySnapshot = await getDocs(this.collection);
      const products = [];

      querySnapshot.forEach((doc) => {
        const productData = { id: doc.id, ...doc.data() };
        const product = Product.fromJSON(productData);

        // Simple text search in name and description
        const searchLower = searchTerm.toLowerCase();
        if (
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower)
        ) {
          products.push(product);
        }
      });

      return {
        success: true,
        data: products,
        count: products.length,
      };
    } catch (error) {
      console.error("Error searching products:", error);
      return {
        success: false,
        error: error.message || "Failed to search products",
      };
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    return this.getProducts({ category });
  }

  // Get featured products
  async getFeaturedProducts(limitCount = 10) {
    try {
      const q = query(
        this.collection,
        where("status", "==", "active"),
        orderBy("rating", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        const productData = { id: doc.id, ...doc.data() };
        const product = Product.fromJSON(productData);
        products.push(product);
      });

      return {
        success: true,
        data: products,
        count: products.length,
      };
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch featured products",
      };
    }
  }

  // Update product stock
  async updateStock(id, newStock) {
    try {
      const productRef = doc(db, this.collectionName, id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      await updateDoc(productRef, {
        stockQuantity: newStock,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        message: "Stock updated successfully",
      };
    } catch (error) {
      console.error("Error updating stock:", error);
      return {
        success: false,
        error: error.message || "Failed to update stock",
      };
    }
  }
}

const productService = new ProductService();
export default productService;
