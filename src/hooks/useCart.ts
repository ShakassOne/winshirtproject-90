
import { useState, useEffect, useCallback } from 'react';
import { ExtendedProduct } from '@/types/product';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  options?: CartItemOptions;
}

interface CartItemOptions {
  size?: string;
  color?: string;
  customization?: any;
  visualDesign?: any;
}

const useCart = () => {
  const getCart = useCallback(() => {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error("Error getting cart from localStorage:", error);
      return [];
    }
  }, []);

  const [cart, setCart] = useState<CartItem[]>(getCart());

  useEffect(() => {
    const handleStorageChange = () => {
      setCart(getCart());
    };
    
    // Listen for storage changes (for cross-tab sync)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, [getCart]);

  const getItemCount = useCallback(() => {
    const cart = getCart();
    return cart.reduce((total: number, item: CartItem) => total + item.quantity, 0);
  }, [getCart]);
  
  // Add this function to increment lottery participants when a product associated with a lottery is added
  const incrementLotteryParticipants = (productId: number) => {
    try {
      // Get the product to find linked lotteries
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const product = products.find((p: any) => p.id === productId);
      
      if (product && product.linkedLotteries && product.linkedLotteries.length > 0) {
        // Get current lotteries
        const lotteries = JSON.parse(localStorage.getItem('lotteries') || '[]');
        
        // Update each linked lottery
        product.linkedLotteries.forEach((lotteryId: number) => {
          const lotteryIndex = lotteries.findIndex((lottery: any) => lottery.id === lotteryId);
          if (lotteryIndex >= 0) {
            // Increment participants count for both camelCase and snake_case properties
            // This ensures all components can properly display the updated count
            lotteries[lotteryIndex].currentParticipants = 
              (lotteries[lotteryIndex].currentParticipants || 0) + 1;
            lotteries[lotteryIndex].current_participants = 
              (lotteries[lotteryIndex].current_participants || 0) + 1;
            
            console.log(`Incremented participants for lottery ${lotteryId} to ${lotteries[lotteryIndex].currentParticipants}`);
          }
        });
        
        // Save updated lotteries
        localStorage.setItem('lotteries', JSON.stringify(lotteries));
        
        // Dispatch an event to notify components of the update
        window.dispatchEvent(new Event('lotteriesUpdated'));
      }
    } catch (error) {
      console.error('Error incrementing lottery participants:', error);
    }
  };

  // Update the addToCart function to call incrementLotteryParticipants
  const addToCart = (product: ExtendedProduct, quantity: number = 1, options?: CartItemOptions) => {
    try {
      const existingCart = getCart();
      
      // Check if the product is already in the cart with the same options
      const existingItemIndex = existingCart.findIndex(item => 
        item.productId === product.id && 
        JSON.stringify(item.options) === JSON.stringify(options)
      );
      
      if (existingItemIndex !== -1) {
        // If product exists, update quantity
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // Otherwise add new item
        existingCart.push({
          id: Date.now(),
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '',
          quantity,
          options: options || {},
        });
        
        // Increment lottery participants when new product is added
        incrementLotteryParticipants(product.id);
      }
      
      // Save the updated cart
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Dispatch cart update event
      const event = new Event('cartUpdated');
      window.dispatchEvent(event);
      
      // Update the local state
      setCart(existingCart);
      
      // Return the updated cart
      return existingCart;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return getCart(); // Return current cart if error
    }
  };

  const removeFromCart = (itemId: number) => {
    try {
      const existingCart = getCart();
      const updatedCart = existingCart.filter(item => item.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Dispatch cart update event
      const event = new Event('cartUpdated');
      window.dispatchEvent(event);
      
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    try {
      const existingCart = getCart();
      const updatedCart = existingCart.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: quantity };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Dispatch cart update event
      const event = new Event('cartUpdated');
      window.dispatchEvent(event);
      
      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const clearCart = () => {
    try {
      localStorage.removeItem('cart');
      
      // Dispatch cart update event
      const event = new Event('cartUpdated');
      window.dispatchEvent(event);
      
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const calculateTotal = useCallback(() => {
    const cart = getCart();
    return cart.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
  }, [getCart]);

  return {
    cart,
    getItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateTotal,
  };
};

export { useCart };
