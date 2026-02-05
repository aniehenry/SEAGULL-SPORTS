import { db, auth } from "../../../../firebasecongif";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import Item from "../models/Item";

const getItemsCollectionRef = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return collection(db, "admin", user.uid, "items");
};

const itemService = {
  async getAllItems() {
    try {
      const itemsRef = getItemsCollectionRef();
      const snapshot = await getDocs(itemsRef);
      return snapshot.docs.map((doc) => Item.fromFirestore(doc));
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },

  async getItemById(itemId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const itemRef = doc(db, "admin", user.uid, "items", itemId);
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
      const item = new Item(itemData);
      const docRef = await addDoc(itemsRef, item.toFirestore());
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
      const itemRef = doc(db, "admin", user.uid, "items", itemId);
      const item = new Item(itemData);
      await updateDoc(itemRef, item.toFirestore());
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
      const itemRef = doc(db, "admin", user.uid, "items", itemId);
      await deleteDoc(itemRef);
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
      const itemRef = doc(db, "admin", user.uid, "items", itemId);
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
