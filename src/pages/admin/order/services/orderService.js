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
  collectionGroup,
} from "firebase/firestore";
import { db } from "../../../../firebasecongif";
import Order from "../models/Order";

// Get all orders from all users (for admin view)
export const getAllOrders = async (adminUserId) => {
  try {
    console.log("Fetching all orders from users collections...");
    
    // Use collectionGroup to get all orders from all users
    const ordersQuery = query(
      collectionGroup(db, "orders")
    );
    
    const snapshot = await getDocs(ordersQuery);
    
    console.log("Orders snapshot size:", snapshot.size);
    
    if (snapshot.empty) {
      console.log("No orders found in any user collection");
      return { success: true, orders: [] };
    }

    const orders = [];
    snapshot.forEach((doc) => {
      const orderData = doc.data();
      console.log("Processing order:", doc.id, orderData);
      
      // Handle date conversion more safely
      let orderDate;
      if (orderData.createdAt && typeof orderData.createdAt.toDate === 'function') {
        orderDate = orderData.createdAt.toDate();
      } else if (orderData.createdAt && orderData.createdAt instanceof Date) {
        orderDate = orderData.createdAt;
      } else if (orderData.orderDate && typeof orderData.orderDate.toDate === 'function') {
        orderDate = orderData.orderDate.toDate();
      } else if (orderData.orderDate && orderData.orderDate instanceof Date) {
        orderDate = orderData.orderDate;
      } else {
        orderDate = new Date();
      }
      
      orders.push({
        orderId: doc.id,
        orderNumber: orderData.orderNumber || `ORD-${doc.id.slice(-8)}`,
        customerName: orderData.userId || "Unknown Customer",
        customerPhone: orderData.customerPhone || "N/A",
        customerEmail: orderData.customerEmail || "N/A",
        orderDate: orderDate,
        items: orderData.items || [],
        totalAmount: orderData.total || orderData.totalAmount || 0,
        status: orderData.status || "pending",
        paymentStatus: orderData.paymentStatus || "pending",
        customerNotes: orderData.customerNotes || "",
        userId: orderData.userId
      });
    });

    console.log("Processed orders:", orders);
    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return { success: false, error: error.message };
  }
};

// Get specific order by ID from users collection
export const getOrderById = async (adminUserId, orderId) => {
  try {
    // Search through all users' orders to find the specific order
    const ordersQuery = query(
      collectionGroup(db, "orders")
    );
    
    const snapshot = await getDocs(ordersQuery);
    
    let foundOrder = null;
    snapshot.forEach((doc) => {
      if (doc.id === orderId) {
        const orderData = doc.data();
        foundOrder = {
          orderId: doc.id,
          orderNumber: orderData.orderNumber,
          customerName: orderData.userId,
          customerPhone: "N/A",
          customerEmail: "N/A",
          orderDate: orderData.createdAt?.toDate?.() || orderData.createdAt,
          items: orderData.items || [],
          totalAmount: orderData.total || 0,
          subtotal: orderData.subtotal || 0,
          tax: orderData.tax || 0,
          status: orderData.status || "pending",
          paymentStatus: orderData.paymentStatus || "pending",
          customerNotes: orderData.customerNotes || "",
          deliveryAddress: orderData.deliveryAddress,
          userId: orderData.userId
        };
      }
    });

    if (!foundOrder) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, order: foundOrder };
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return { success: false, error: error.message };
  }
};

const getOrdersCollection = (userId) => {
  return collection(db, "Admin", userId, "orders");
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

// Update order status in user collection
export const updateOrderStatus = async (adminUserId, orderId, status) => {
  try {
    // Find the order first to get the userId
    const ordersQuery = query(collectionGroup(db, "orders"));
    const snapshot = await getDocs(ordersQuery);
    
    let orderRef = null;
    snapshot.forEach((doc) => {
      if (doc.id === orderId) {
        // Get the parent user document path
        const orderPath = doc.ref.path; // e.g., "users/userId/orders/orderId"
        orderRef = doc.ref;
      }
    });

    if (!orderRef) {
      return { success: false, error: "Order not found" };
    }

    await updateDoc(orderRef, { 
      status: status,
      updatedAt: new Date()
    });
    
    return { success: true, message: "Order status updated successfully" };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
};

// Update payment status in user collection  
export const updatePaymentStatus = async (adminUserId, orderId, paymentStatus) => {
  try {
    // Find the order first to get the userId
    const ordersQuery = query(collectionGroup(db, "orders"));
    const snapshot = await getDocs(ordersQuery);
    
    let orderRef = null;
    snapshot.forEach((doc) => {
      if (doc.id === orderId) {
        orderRef = doc.ref;
      }
    });

    if (!orderRef) {
      return { success: false, error: "Order not found" };
    }

    await updateDoc(orderRef, { 
      paymentStatus: paymentStatus,
      updatedAt: new Date()
    });
    
    return { success: true, message: "Payment status updated successfully" };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: error.message };
  }
};

// Delete order from user collection
export const deleteOrder = async (adminUserId, orderId) => {
  try {
    // Find the order first to get the userId
    const ordersQuery = query(collectionGroup(db, "orders"));
    const snapshot = await getDocs(ordersQuery);
    
    let orderRef = null;
    snapshot.forEach((doc) => {
      if (doc.id === orderId) {
        orderRef = doc.ref;
      }
    });

    if (!orderRef) {
      return { success: false, error: "Order not found" };
    }

    await deleteDoc(orderRef);
    return { success: true, message: "Order deleted successfully" };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, error: error.message };
  }
};
