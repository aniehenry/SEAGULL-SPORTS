import { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import { useAuth } from '../../../../contexts/AuthContext';

const useOrderController = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's orders
  const loadOrders = async () => {
    if (!user || !user.uid) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await orderService.getUserOrders(user.uid);
      
      if (result.success) {
        setOrders(result.orders);
      } else {
        setError(result.error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new order
  const createOrder = async (orderData) => {
    if (!user || !user.uid) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    try {
      const result = await orderService.createOrder(user.uid, orderData);
      
      if (result.success) {
        // Refresh orders list
        await loadOrders();
        return {
          success: true,
          order: result.order,
          message: result.message
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error("Error creating order:", error);
      return {
        success: false,
        error: error.message || "Failed to create order"
      };
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status, notes = '') => {
    if (!user || !user.uid) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    try {
      const result = await orderService.updateOrderStatus(user.uid, orderId, status, notes);
      
      if (result.success) {
        // Refresh orders list
        await loadOrders();
        return {
          success: true,
          message: result.message
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        error: error.message || "Failed to update order"
      };
    }
  };

  // Cancel order
  const cancelOrder = async (orderId, reason = '') => {
    if (!user || !user.uid) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    try {
      const result = await orderService.cancelOrder(user.uid, orderId, reason);
      
      if (result.success) {
        // Refresh orders list
        await loadOrders();
        return {
          success: true,
          message: result.message
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      return {
        success: false,
        error: error.message || "Failed to cancel order"
      };
    }
  };

  // Load orders when user changes
  useEffect(() => {
    if (user?.uid) {
      loadOrders();
    } else {
      setOrders([]);
      setError(null);
    }
  }, [user]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    refreshOrders: loadOrders,
  };
};

export default useOrderController;