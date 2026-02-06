import { db } from "../../../../firebasecongif";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import Product from "../models/Product";

const productService = {
  async getAllProducts() {
    try {
      console.log("🔍 Fetching all products from all admins...");
      
      // Get all admin users first
      const adminCollectionRef = collection(db, "Admin");
      const adminSnapshot = await getDocs(adminCollectionRef);
      
      let allProducts = [];
      
      // Loop through each admin and get their items
      for (const adminDoc of adminSnapshot.docs) {
        const adminId = adminDoc.id;
        console.log(`📂 Checking admin: ${adminId}`);
        
        try {
          const itemsRef = collection(db, "Admin", adminId, "items");
          const itemsSnapshot = await getDocs(itemsRef);
          
          const adminProducts = itemsSnapshot.docs.map((doc) => {
            const productData = Product.fromFirestore(doc);
            // Add admin info to track which admin owns this product
            productData.adminId = adminId;
            return productData;
          });
          
          console.log(`✅ Found ${adminProducts.length} products from admin ${adminId}`);
          allProducts = [...allProducts, ...adminProducts];
        } catch (error) {
          console.log(`⚠️ No items found for admin ${adminId}:`, error.message);
        }
      }
      
      console.log(`🎯 Total products fetched: ${allProducts.length}`);
      return allProducts;
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      throw error;
    }
  },

  async getProductById(adminId, productId) {
    try {
      const productRef = doc(db, "Admin", adminId, "items", productId);
      const productDoc = await getDoc(productRef);
      
      if (productDoc.exists()) {
        const product = Product.fromFirestore(productDoc);
        product.adminId = adminId;
        return product;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  async getProductsByCategory(category) {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => 
        product.category.toLowerCase().includes(category.toLowerCase())
      );
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  async searchProducts(searchTerm) {
    try {
      const allProducts = await this.getAllProducts();
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(lowercaseSearchTerm) ||
        product.description.toLowerCase().includes(lowercaseSearchTerm) ||
        product.category.toLowerCase().includes(lowercaseSearchTerm)
      );
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },

  async getAvailableProducts() {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => product.isInStock());
    } catch (error) {
      console.error("Error fetching available products:", error);
      throw error;
    }
  }
};

export default productService;