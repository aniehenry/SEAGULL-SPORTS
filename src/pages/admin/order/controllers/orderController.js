import * as orderService from "../services/orderService";
import Order from "../models/Order";

// Fetch all orders
export const fetchOrders = async (userId) => {
  try {
    const result = await orderService.getAllOrders(userId);
    return result;
  } catch (error) {
    console.error("Error in fetchOrders controller:", error);
    return { success: false, error: error.message };
  }
};

// Fetch single order by ID
export const fetchOrderById = async (userId, orderId) => {
  try {
    const result = await orderService.getOrderById(userId, orderId);
    return result;
  } catch (error) {
    console.error("Error in fetchOrderById controller:", error);
    return { success: false, error: error.message };
  }
};

// Create a new order
export const createOrder = async (userId, orderData) => {
  try {
    // Validate order data
    const validation = Order.validate(orderData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const result = await orderService.addOrder(userId, orderData);
    return result;
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    return { success: false, error: error.message };
  }
};

// Update order status
export const updateOrderStatus = async (userId, orderId, status) => {
  try {
    const result = await orderService.updateOrderStatus(
      userId,
      orderId,
      status,
    );
    return result;
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    return { success: false, error: error.message };
  }
};

// Update payment status
export const updatePaymentStatus = async (userId, orderId, paymentStatus) => {
  try {
    const result = await orderService.updatePaymentStatus(
      userId,
      orderId,
      paymentStatus,
    );
    return result;
  } catch (error) {
    console.error("Error in updatePaymentStatus controller:", error);
    return { success: false, error: error.message };
  }
};

// Delete order
export const deleteOrder = async (userId, orderId) => {
  try {
    const result = await orderService.deleteOrder(userId, orderId);
    return result;
  } catch (error) {
    console.error("Error in deleteOrder controller:", error);
    return { success: false, error: error.message };
  }
};
