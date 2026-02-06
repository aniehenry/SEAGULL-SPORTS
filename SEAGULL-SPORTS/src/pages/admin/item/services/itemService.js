import { db, auth } from "../../../../firebasecongif";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import Item from "../models/Item";

const getItemsCollectionRef = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  // Use subcollection under Admin/{userId}/items
  return collection(db, "Admin", user.uid, "items");
};

const itemService = {
  async getAllItems() {
    try {
      console.log("🔍 Getting items from subcollection...");
      const user = auth.currentUser;
      console.log("👤 Current user:", user ? user.email : "No user");
      console.log("🆔 User UID:", user ? user.uid : "No UID");
      
      const itemsRef = getItemsCollectionRef();
      console.log("📂 Items collection ref path: Admin/" + user.uid + "/items");
      
      // First try without ordering to see if items exist
      const snapshot = await getDocs(itemsRef);
      
      console.log("📊 Snapshot size:", snapshot.size);
      console.log("📄 Snapshot empty:", snapshot.empty);
      
      const items = snapshot.docs.map((doc) => {
        console.log("📄 Document ID:", doc.id, "Data:", doc.data());
        return Item.fromFirestore(doc);
      });
      
      console.log("✅ Processed items:", items.length);
      return items;
    } catch (error) {
      console.error("❌ Error fetching items:", error);
      throw error;
    }
  },

  async getItemById(itemId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const itemRef = doc(db, "Admin", user.uid, "items", itemId);
      const itemDoc = await getDoc(itemRef);
      if (itemDoc.exists()) {
        return Item.fromFirestore(itemDoc);
      }
      return null;
    } catch (error) {
      console.error("Error fetching item:", error);
      throw error;
    }
  },

  async addItem(itemData) {
    try {
      const itemsRef = getItemsCollectionRef();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Add timestamps to item data
      const itemWithTimestamps = {
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const item = new Item(itemWithTimestamps);
      const docRef = await addDoc(itemsRef, item.toFirestore());
      console.log("✅ Item added to Admin subcollection with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  },

  async updateItem(itemId, itemData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const itemRef = doc(db, "Admin", user.uid, "items", itemId);
      const itemWithUpdate = {
        ...itemData,
        updatedAt: new Date(),
      };
      
      const item = new Item(itemWithUpdate);
      await updateDoc(itemRef, item.toFirestore());
      console.log("✅ Item updated in Admin subcollection:", itemId);
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  },

  async deleteItem(itemId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const itemRef = doc(db, "Admin", user.uid, "items", itemId);
      await deleteDoc(itemRef);
      console.log("✅ Item deleted from Admin subcollection:", itemId);
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  },

  async updateItemStock(itemId, quantityChange) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const itemRef = doc(db, "Admin", user.uid, "items", itemId);
      const itemDoc = await getDoc(itemRef);

      if (!itemDoc.exists()) {
        throw new Error("Item not found");
      }

      const currentStock = itemDoc.data().stockQuantity || 0;
      const newStock = currentStock + quantityChange;

      if (newStock < 0) {
        throw new Error(
          `Insufficient stock for item. Available: ${currentStock}`,
        );
      }

      await updateDoc(itemRef, {
        stockQuantity: newStock,
        updatedAt: new Date(),
      });

      return newStock;
    } catch (error) {
      console.error("Error updating item stock:", error);
      throw error;
    }
  },
};

export default itemService;
