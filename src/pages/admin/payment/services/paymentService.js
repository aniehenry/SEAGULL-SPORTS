import { db, auth } from "../../../../firebasecongif";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import Payment from "../models/Payment";
import invoiceService from "../../invoice/services/invoiceService";
import purchaseService from "../../purchase/services/purchaseService";

const getPaymentsCollectionRef = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return collection(db, "Admin", user.uid, "payments");
};

const paymentService = {
  async getAllPayments() {
    try {
      const collectionRef = getPaymentsCollectionRef();
      const q = query(collectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => Payment.fromFirestore(doc));
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  async getPaymentById(paymentId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const docRef = doc(db, "Admin", user.uid, "payments", paymentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return Payment.fromFirestore(docSnap);
      } else {
        throw new Error("Payment not found");
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
  },

  async addPayment(paymentData) {
    try {
      const payment = new Payment(paymentData);
      const validation = payment.validate();

      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(", "));
      }

      // Update the invoice or purchase payment details
      if (payment.paymentType === "Invoice") {
        const invoice = await invoiceService.getInvoiceById(
          payment.referenceId,
        );
        const newPaidAmount =
          Number(invoice.paidAmount || 0) + Number(payment.paymentAmount);
        const newDueAmount = Number(invoice.totalAmount) - newPaidAmount;

        let paymentStatus = "Unpaid";
        if (newPaidAmount >= invoice.totalAmount) {
          paymentStatus = "Paid";
        } else if (newPaidAmount > 0) {
          paymentStatus = "Partially Paid";
        }

        await invoiceService.updateInvoice(payment.referenceId, {
          ...invoice,
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          paymentStatus: paymentStatus,
        });
      } else if (payment.paymentType === "Purchase") {
        const purchase = await purchaseService.getPurchaseById(
          payment.referenceId,
        );
        const newPaidAmount =
          Number(purchase.paidAmount || 0) + Number(payment.paymentAmount);
        const newDueAmount = Number(purchase.totalAmount) - newPaidAmount;

        let paymentStatus = "Unpaid";
        if (newPaidAmount >= purchase.totalAmount) {
          paymentStatus = "Paid";
        } else if (newPaidAmount > 0) {
          paymentStatus = "Partially Paid";
        }

        await purchaseService.updatePurchase(payment.referenceId, {
          ...purchase,
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          paymentStatus: paymentStatus,
        });
      }

      const collectionRef = getPaymentsCollectionRef();
      const docRef = await addDoc(collectionRef, payment.toFirestore());
      return docRef.id;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  },

  async deletePayment(paymentId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Get payment to reverse the payment
      const payment = await this.getPaymentById(paymentId);

      // Reverse the payment in invoice or purchase
      if (payment.paymentType === "Invoice") {
        const invoice = await invoiceService.getInvoiceById(
          payment.referenceId,
        );
        const newPaidAmount =
          Number(invoice.paidAmount || 0) - Number(payment.paymentAmount);
        const newDueAmount = Number(invoice.totalAmount) - newPaidAmount;

        let paymentStatus = "Unpaid";
        if (newPaidAmount >= invoice.totalAmount) {
          paymentStatus = "Paid";
        } else if (newPaidAmount > 0) {
          paymentStatus = "Partially Paid";
        }

        await invoiceService.updateInvoice(payment.referenceId, {
          ...invoice,
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          paymentStatus: paymentStatus,
        });
      } else if (payment.paymentType === "Purchase") {
        const purchase = await purchaseService.getPurchaseById(
          payment.referenceId,
        );
        const newPaidAmount =
          Number(purchase.paidAmount || 0) - Number(payment.paymentAmount);
        const newDueAmount = Number(purchase.totalAmount) - newPaidAmount;

        let paymentStatus = "Unpaid";
        if (newPaidAmount >= purchase.totalAmount) {
          paymentStatus = "Paid";
        } else if (newPaidAmount > 0) {
          paymentStatus = "Partially Paid";
        }

        await purchaseService.updatePurchase(payment.referenceId, {
          ...purchase,
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          paymentStatus: paymentStatus,
        });
      }

      const docRef = doc(db, "Admin", user.uid, "payments", paymentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  },

  async generatePaymentNumber() {
    try {
      const payments = await this.getAllPayments();
      const paymentCount = payments.length;
      const newNumber = paymentCount + 1;
      return `PAY-${String(newNumber).padStart(5, "0")}`;
    } catch (error) {
      console.error("Error generating payment number:", error);
      return "PAY-00001";
    }
  },
};

export default paymentService;
