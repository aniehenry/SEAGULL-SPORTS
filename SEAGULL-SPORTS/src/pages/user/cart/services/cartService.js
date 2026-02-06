import CartItem from "../models/CartItem";

const CART_STORAGE_KEY = "seagull-cart";

const cartService = {
  getCart() {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        return cartData.map(item => CartItem.fromJSON(item));
      }
      return [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  },

  saveCart(cart) {
    try {
      const cartData = cart.map(item => item.toJSON());
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      
      // Dispatch custom event for cart updates
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { cartCount: this.getCartItemCount() }
      }));
    } catch (error) {
      console.error("Error saving cart:", error);
      throw error;
    }
  },

  addToCart(product, quantity = 1) {
    try {
      const cart = this.getCart();
      const existingItemIndex = cart.findIndex(item => 
        item.productId === product.id && item.adminId === product.adminId
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const existingItem = cart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity <= product.stockQuantity) {
          cart[existingItemIndex].quantity = newQuantity;
        } else {
          throw new Error("Not enough stock available");
        }
      } else {
        // Add new item to cart
        if (quantity <= product.stockQuantity) {
          const cartItem = new CartItem({
            id: Date.now().toString(), // Simple ID generation
            productId: product.id,
            adminId: product.adminId,
            name: product.name,
            price: product.sellingPrice,
            quantity: quantity,
            image: product.getMainImage(),
            maxStock: product.stockQuantity,
          });
          cart.push(cartItem);
        } else {
          throw new Error("Not enough stock available");
        }
      }

      this.saveCart(cart);
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },

  removeFromCart(itemId) {
    try {
      const cart = this.getCart();
      const updatedCart = cart.filter(item => item.id !== itemId);
      this.saveCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  },

  updateQuantity(itemId, newQuantity) {
    try {
      const cart = this.getCart();
      const itemIndex = cart.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        if (newQuantity <= 0) {
          // Remove item if quantity is 0 or less
          this.removeFromCart(itemId);
        } else if (newQuantity <= cart[itemIndex].maxStock) {
          cart[itemIndex].quantity = newQuantity;
          this.saveCart(cart);
        } else {
          throw new Error("Quantity exceeds available stock");
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    }
  },

  clearCart() {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      
      // Dispatch multiple events to ensure navbar updates
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { cartCount: 0 }
      }));
      
      // Also trigger storage event manually since removeItem might not trigger it
      window.dispatchEvent(new StorageEvent('storage', {
        key: CART_STORAGE_KEY,
        oldValue: localStorage.getItem(CART_STORAGE_KEY),
        newValue: null,
        storageArea: localStorage
      }));
      
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.getTotalPrice(), 0);
  },

  getCartItemCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  isProductInCart(productId, adminId) {
    const cart = this.getCart();
    return cart.some(item => 
      item.productId === productId && item.adminId === adminId
    );
  }
};

export default cartService;