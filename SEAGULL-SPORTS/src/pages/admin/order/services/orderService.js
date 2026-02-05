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
import { db } from "../../../../firebasecongif";
import Order from "../models/Order";

const getOrdersCollection = (userId) => {
  return collection(db, "admin", userId, "orders");
};

// Generate order number
export const generateOrderNumber = async (userId) => {
  try {
    const ordersRef = getOrdersCollection(userId);
    const q = query(ordersRef, orderBy("orderNumber", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return "ORD-00001";
    }

    const lastOrder = snapshot.docs[0].data();
    const lastNumber = parseInt(lastOrder.orderNumber.split("-")[1]);
    const newNumber = lastNumber + 1;
    return `ORD-${String(newNumber).padStart(5, "0")}`;
  } catch (error) {
    console.error("Error generating order number:", error);
    return "ORD-00001";
  }
};

// Add a new order
export const addOrder = async (userId, orderData) => {
  try {
    const ordersRef = getOrdersCollection(userId);
    const order = new Order(
      "",
      orderData.orderNumber,
      orderData.customerName,
      orderData.customerPhone,
      orderData.customerEmail,
      orderData.items,
      orderData.totalAmount,
      orderData.orderDate,
      orderData.status,
      orderData.paymentStatus,
      orderData.deliveryAddress,
      orderData.notes,
    );

    const docRef = await addDoc(ordersRef, order.toFirestore());
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error("Error adding order:", error);
    return { success: false, error: error.message };
  }
};

// Get all orders
export const getAllOrders = async (userId) => {
  try {
    const ordersRef = getOrdersCollection(userId);
    const q = query(ordersRef, orderBy("orderDate", "desc"));
    const snapshot = await getDocs(q);

    const orders = [];
    snapshot.forEach((doc) => {
      orders.push(Order.fromFirestore(doc));
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: error.message };
  }
};

// Get a single order by ID
export const getOrderById = async (userId, orderId) => {
  try {
    const orderRef = doc(db, "admin", userId, "orders", orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      return { success: false, error: "Order not found" };
    }

    const order = Order.fromFirestore(orderDoc);
    return { success: true, order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: error.message };
  }
};

// Update order
export const updateOrder = async (userId, orderId, updateData) => {
  try {
    const orderRef = doc(db, "admin", userId, "orders", orderId);
    await updateDoc(orderRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error: error.message };
  }
};

// Update order status
export const updateOrderStatus = async (userId, orderId, status) => {
  return updateOrder(userId, orderId, { status });
};

// Update payment status
export const updatePaymentStatus = async (userId, orderId, paymentStatus) => {
  return updateOrder(userId, orderId, { paymentStatus });
};

// Delete order
export const deleteOrder = async (userId, orderId) => {
  try {
    const orderRef = doc(db, "admin", userId, "orders", orderId);
    await deleteDoc(orderRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, error: error.message };
  }
};
