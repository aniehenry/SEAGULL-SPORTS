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
import Purchase from "../models/Purchase";
import itemService from "../../item/services/itemService";

const getPurchasesCollectionRef = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return collection(db, "admin", user.uid, "purchases");
};

const purchaseService = {
  async getAllPurchases() {
    try {
      const collectionRef = getPurchasesCollectionRef();
      const q = query(collectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => Purchase.fromFirestore(doc));
    } catch (error) {
      console.error("Error fetching purchases:", error);
      throw error;
    }
  },

  async getPurchaseById(purchaseId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const docRef = doc(db, "admin", user.uid, "purchases", purchaseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return Purchase.fromFirestore(docSnap);
      } else {
        throw new Error("Purchase not found");
      }
    } catch (error) {
      console.error("Error fetching purchase:", error);
      throw error;
    }
  },

  async addPurchase(purchaseData) {
    try {
      const purchase = new Purchase(purchaseData);
      const validation = purchase.validate();

      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(", "));
      }

      // Update stock for each item (add to stock for purchases)
      for (const item of purchaseData.items) {
        if (item.itemId && item.quantity) {
          await itemService.updateItemStock(item.itemId, item.quantity);
        }
      }

      const collectionRef = getPurchasesCollectionRef();
      const docRef = await addDoc(collectionRef, purchase.toFirestore());
      return docRef.id;
    } catch (error) {
      console.error("Error adding purchase:", error);
      throw error;
    }
  },

  async updatePurchase(purchaseId, purchaseData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const purchase = new Purchase(purchaseData);
      const validation = purchase.validate();

      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(", "));
      }

      // Get old purchase to restore stock
      const oldPurchase = await this.getPurchaseById(purchaseId);

      // Restore stock from old purchase (remove the added stock)
      for (const oldItem of oldPurchase.items) {
        if (oldItem.itemId && oldItem.quantity) {
          await itemService.updateItemStock(oldItem.itemId, -oldItem.quantity);
        }
      }

      // Add stock for new purchase items
      for (const newItem of purchaseData.items) {
        if (newItem.itemId && newItem.quantity) {
          await itemService.updateItemStock(newItem.itemId, newItem.quantity);
        }
      }

      const docRef = doc(db, "admin", user.uid, "purchases", purchaseId);
      await updateDoc(docRef, purchase.toFirestore());
    } catch (error) {
      console.error("Error updating purchase:", error);
      throw error;
    }
  },

  async deletePurchase(purchaseId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Get purchase to restore stock
      const purchase = await this.getPurchaseById(purchaseId);

      // Restore stock for all items (remove the added stock)
      for (const item of purchase.items) {
        if (item.itemId && item.quantity) {
          await itemService.updateItemStock(item.itemId, -item.quantity);
        }
      }

      const docRef = doc(db, "admin", user.uid, "purchases", purchaseId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting purchase:", error);
      throw error;
    }
  },

  async generatePurchaseNumber() {
    try {
      const purchases = await this.getAllPurchases();
      const purchaseCount = purchases.length;
      const newNumber = purchaseCount + 1;
      return `PUR-${String(newNumber).padStart(5, "0")}`;
    } catch (error) {
      console.error("Error generating purchase number:", error);
      return "PUR-00001";
    }
  },
};

export default purchaseService;
