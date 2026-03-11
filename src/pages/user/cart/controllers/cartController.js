import { useState, useEffect } from "react";
import cartService from "../services/cartService";
import orderService from "../../order/services/orderService";
import { useAuth } from "../../../../contexts/AuthContext";

const useCartController = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart items on component mount
  useEffect(() => {
    loadCartItems();
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      loadCartItems();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const loadCartItems = () => {
    try {
      setLoading(true);
      setError(null);
      const items = cartService.getCart();
      setCartItems(items);
    } catch (err) {
      console.error("Error loading cart:", err);
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await cartService.updateQuantity(itemId, newQuantity);
      loadCartItems(); // Refresh cart items
      return { success: true };
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err.message || "Failed to update quantity");
      return { success: false, message: err.message };
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      loadCartItems(); // Refresh cart items
      return { success: true };
    } catch (err) {
      console.error("Error removing item:", err);
      setError(err.message || "Failed to remove item");
      return { success: false, message: err.message };
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      
      // Force immediate update of cart count in navbar
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { cartCount: 0 }
        }));
      }, 100);
      
      loadCartItems(); // Refresh cart items
      return { success: true };
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError(err.message || "Failed to clear cart");
      return { success: false, message: err.message };
    }
  };

  const getCartSummary = () => {
    const totalItems = cartService.getCartItemCount();
    const totalAmount = cartService.getCartTotal();
    
    return {
      totalItems,
      totalAmount,
      isEmpty: totalItems === 0
    };
  };

  const increaseQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item && item.canIncreaseQuantity()) {
      handleUpdateQuantity(itemId, item.quantity + 1);
    }
  };

  const decreaseQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      if (item.quantity > 1) {
        handleUpdateQuantity(itemId, item.quantity - 1);
      } else {
        handleRemoveItem(itemId);
      }
    }
  };

  const handleCheckout = async (customerNotes = '') => {
    try {
      if (!user || !user.uid) {
        throw new Error("User not authenticated");
      }

      if (cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // Calculate totals from cart
      const cartSummary = getCartSummary();
      const subtotal = cartSummary.totalAmount;
      const tax = 0; // No tax for now
      const total = subtotal + tax;

      // Prepare order data from cart items
      const orderData = {
        userId: user.uid,
        items: cartItems.map(item => ({
          id: item.id || '',
          name: item.name || '',
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image || '',
          category: item.category || 'general',
          adminId: item.adminId || ''
        })),
        subtotal: subtotal,
        tax: tax,
        total: total,
        customerNotes: customerNotes || '',
        status: 'pending',
        paymentStatus: 'pending',
        deliveryAddress: null
      };

      console.log("Processing checkout for user:", user.uid);
      console.log("Order data:", orderData);

      // Create the order
      const result = await orderService.createOrder(user.uid, orderData);
      
      if (result.success) {
        // Clear the cart after successful order creation
        const clearResult = await handleClearCart();
        
        if (!clearResult.success) {
          console.warn("Order created but failed to clear cart:", clearResult.message);
        }
        
        return {
          success: true,
          order: result.order,
          message: result.message
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error("Checkout error:", error);
      return {
        success: false,
        error: error.message || "Failed to process checkout"
      };
    }
  };

  return {
    cartItems,
    loading,
    error,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    getCartSummary,
    increaseQuantity,
    decreaseQuantity,
    handleCheckout,
    refreshCart: loadCartItems,
  };
};

export default useCartController;