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
import Invoice from "../models/Invoice";
import itemService from "../../item/services/itemService";

const getInvoicesCollectionRef = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return collection(db, "admin", user.uid, "invoices");
};

const invoiceService = {
  async getAllInvoices() {
    try {
      const collectionRef = getInvoicesCollectionRef();
      const querySnapshot = await getDocs(collectionRef);
      return querySnapshot.docs.map((doc) => Invoice.fromFirestore(doc));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  },

  async getInvoiceById(invoiceId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const docRef = doc(db, "admin", user.uid, "invoices", invoiceId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return Invoice.fromFirestore(docSnap);
      } else {
        throw new Error("Invoice not found");
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  },

  async addInvoice(invoiceData) {
    try {
      const invoice = new Invoice(invoiceData);
      const validation = invoice.validate();

      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(", "));
      }

      // Update stock for each item
      for (const item of invoiceData.items) {
        if (item.itemId && item.quantity) {
          await itemService.updateItemStock(item.itemId, -item.quantity);
        }
      }

      const collectionRef = getInvoicesCollectionRef();
      const docRef = await addDoc(collectionRef, invoice.toFirestore());
      return docRef.id;
    } catch (error) {
      console.error("Error adding invoice:", error);
      throw error;
    }
  },

  async updateInvoice(invoiceId, invoiceData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const invoice = new Invoice(invoiceData);
      const validation = invoice.validate();

      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(", "));
      }

      // Get old invoice to restore stock
      const oldInvoice = await this.getInvoiceById(invoiceId);

      // Restore stock from old invoice
      for (const oldItem of oldInvoice.items) {
        if (oldItem.itemId && oldItem.quantity) {
          await itemService.updateItemStock(oldItem.itemId, oldItem.quantity);
        }
      }

      // Deduct stock for new invoice items
      for (const newItem of invoiceData.items) {
        if (newItem.itemId && newItem.quantity) {
          await itemService.updateItemStock(newItem.itemId, -newItem.quantity);
        }
      }

      const docRef = doc(db, "admin", user.uid, "invoices", invoiceId);
      await updateDoc(docRef, invoice.toFirestore());
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  },

  async deleteInvoice(invoiceId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Get invoice to restore stock
      const invoice = await this.getInvoiceById(invoiceId);

      // Restore stock for all items
      for (const item of invoice.items) {
        if (item.itemId && item.quantity) {
          await itemService.updateItemStock(item.itemId, item.quantity);
        }
      }

      const docRef = doc(db, "admin", user.uid, "invoices", invoiceId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  },

  async generateInvoiceNumber() {
    try {
      const invoices = await this.getAllInvoices();
      if (invoices.length === 0) {
        return 1;
      }

      // Find the maximum invoice number
      const maxInvoiceNumber = Math.max(
        ...invoices.map((invoice) => {
          const num = parseInt(invoice.invoiceNumber);
          return isNaN(num) ? 0 : num;
        }),
      );

      return maxInvoiceNumber + 1;
    } catch (error) {
      console.error("Error generating invoice number:", error);
      return 1;
    }
  },
};

export default invoiceService;
