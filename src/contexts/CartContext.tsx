import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartContextType } from '@/types/cart';
import { toast } from '@/lib/toast';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        // Reset cart if there's an error
        localStorage.removeItem('cart');
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      // Check if the item already exists with the same size and color
      const existingItemIndex = currentItems.findIndex(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );
      
      if (existingItemIndex >= 0) {
        // If it exists, update the quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        toast.success(`Quantité mise à jour: ${item.name}`);
        return updatedItems;
      } else {
        // Otherwise add it as a new item
        toast.success(`Ajouté au panier: ${item.name}`);
        return [...currentItems, item];
      }
    });
  };
  
  const updateItemQuantity = (index: number, quantity: number) => {
    setItems(currentItems => {
      // Validate that index is within range
      if (index < 0 || index >= currentItems.length) return currentItems;
      
      // Validate that new quantity is valid
      if (quantity <= 0) {
        // Remove the item if quantity is 0 or negative
        const newItems = [...currentItems];
        const removedItem = newItems[index];
        newItems.splice(index, 1);
        toast.info(`Retiré du panier: ${removedItem.name}`);
        return newItems;
      } else {
        // Update the quantity
        const newItems = [...currentItems];
        newItems[index].quantity = quantity;
        return newItems;
      }
    });
  };
  
  const removeItem = (index: number) => {
    setItems(currentItems => {
      if (index < 0 || index >= currentItems.length) return currentItems;
      
      const newItems = [...currentItems];
      const removedItem = newItems[index];
      newItems.splice(index, 1);
      
      toast.info(`Retiré du panier: ${removedItem.name}`);
      return newItems;
    });
  };
  
  const clearCart = () => {
    setItems([]);
    toast.info('Votre panier a été vidé');
  };
  
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Context value
  const value: CartContextType = {
    items,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    calculateTotal
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};
