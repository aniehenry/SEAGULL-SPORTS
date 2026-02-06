import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../../../../firebasecongif";
import Order from "../models/Order";

class OrderService {
  constructor() {
    this.collectionName = "orders";
  }

  // Get orders collection reference for a specific user
  getOrdersCollection(userId) {
    return collection(db, "users", userId, this.collectionName);
  }

  // Create a new order
  async createOrder(userId, orderData) {
    try {
      console.log("Creating order for user:", userId);
      console.log("Order data:", orderData);

      const order = new Order({
        ...orderData,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Calculate totals
      order.calculateTotals();

      // Validate order
      const validation = order.validate();
      if (!validation.isValid) {
        throw new Error(`Order validation failed: ${validation.errors.join(', ')}`);
      }

      // Get the orders collection for this user
      const ordersCollection = this.getOrdersCollection(userId);

      // Add to Firestore with server timestamp
      const docRef = await addDoc(ordersCollection, {
        ...order.toFirestore(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log("Order created with ID:", docRef.id);

      // Return the created order with the generated ID
      order.id = docRef.id;
      return {
        success: true,
        order: order,
        message: `Order ${order.orderNumber} created successfully`
      };

    } catch (error) {
      console.error("Error creating order:", error);
      return {
        success: false,
        error: error.message || "Failed to create order"
      };
    }
  }

  // Get a specific order by ID
  async getOrder(userId, orderId) {
    try {
      const orderDoc = doc(db, "users", userId, this.collectionName, orderId);
      const docSnap = await getDoc(orderDoc);

      if (!docSnap.exists()) {
        throw new Error("Order not found");
      }

      const order = Order.fromFirestore(docSnap);
      return {
        success: true,
        order: order
      };

    } catch (error) {
      console.error("Error getting order:", error);
      return {
        success: false,
        error: error.message || "Failed to get order"
      };
    }
  }

  // Get all orders for a user
  async getUserOrders(userId, options = {}) {
    try {
      const {
        orderByField = "createdAt",
        orderDirection = "desc",
        limitCount = null,
        status = null
      } = options;

      const ordersCollection = this.getOrdersCollection(userId);
      
      let q = query(ordersCollection, orderBy(orderByField, orderDirection));

      // Add status filter if provided
      if (status) {
        q = query(q, where("status", "==", status));
      }

      // Add limit if provided
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      
      const orders = [];
      querySnapshot.forEach((doc) => {
        try {
          const order = Order.fromFirestore(doc);
          orders.push(order);
        } catch (error) {
          console.error(`Error parsing order ${doc.id}:`, error);
        }
      });

      return {
        success: true,
        orders: orders,
        count: orders.length
      };

    } catch (error) {
      console.error("Error getting user orders:", error);
      return {
        success: false,
        error: error.message || "Failed to get orders"
      };
    }
  }

  // Update order status
  async updateOrderStatus(userId, orderId, status) {
    try {
      const orderDoc = doc(db, "users", userId, this.collectionName, orderId);
      
      await updateDoc(orderDoc, {
        status: status,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: `Order status updated to ${status}`
      };

    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        error: error.message || "Failed to update order status"
      };
    }
  }

  // Update payment status
  async updatePaymentStatus(userId, orderId, paymentStatus) {
    try {
      const orderDoc = doc(db, "users", userId, this.collectionName, orderId);
      
      await updateDoc(orderDoc, {
        paymentStatus: paymentStatus,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: `Payment status updated to ${paymentStatus}`
      };

    } catch (error) {
      console.error("Error updating payment status:", error);
      return {
        success: false,
        error: error.message || "Failed to update payment status"
      };
    }
  }

  // Cancel an order
  async cancelOrder(userId, orderId, reason = '') {
    try {
      const orderDoc = doc(db, "users", userId, this.collectionName, orderId);
      
      await updateDoc(orderDoc, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: "Order cancelled successfully"
      };

    } catch (error) {
      console.error("Error cancelling order:", error);
      return {
        success: false,
        error: error.message || "Failed to cancel order"
      };
    }
  }

  // Delete an order (admin only)
  async deleteOrder(userId, orderId) {
    try {
      const orderDoc = doc(db, "users", userId, this.collectionName, orderId);
      await deleteDoc(orderDoc);

      return {
        success: true,
        message: "Order deleted successfully"
      };

    } catch (error) {
      console.error("Error deleting order:", error);
      return {
        success: false,
        error: error.message || "Failed to delete order"
      };
    }
  }

  // Get order statistics for a user
  async getOrderStats(userId) {
    try {
      const result = await this.getUserOrders(userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const orders = result.orders;
      
      const stats = {
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + order.total, 0),
        statusBreakdown: {},
        recentOrders: orders.slice(0, 5) // Last 5 orders
      };

      // Calculate status breakdown
      orders.forEach(order => {
        stats.statusBreakdown[order.status] = (stats.statusBreakdown[order.status] || 0) + 1;
      });

      return {
        success: true,
        stats: stats
      };

    } catch (error) {
      console.error("Error getting order stats:", error);
      return {
        success: false,
        error: error.message || "Failed to get order statistics"
      };
    }
  }
}

// Export singleton instance
const orderService = new OrderService();
export default orderService;