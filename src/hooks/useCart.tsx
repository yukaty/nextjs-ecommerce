'use client'; // Runs on client (browser) side

import { useState, useEffect, useCallback, useMemo, useContext, createContext } from 'react';

// Type definition for cart item
export interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

// Context type definition
interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>, addQuantity?: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  isInCart: (id: string) => boolean;
  totalPrice: number;
  totalQuantity: number;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage key name
const STORAGE_KEY = 'cartItems';

// Custom hook for cart management
export function useCart() {
  // Get cart context
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider.');
  }
  return context;
}

// Component that provides context
export function CartProvider({ children }: { children: React.ReactNode }) {
  // Array to manage cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Get cart info from local storage (first time only)
    if (typeof window === 'undefined') return []; // Skip if not browser
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error('Cart loading error:', error);
      return [];
    }
  });

  // Update local storage whenever cart state changes
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip if not browser
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Cart save error:', error);
    }
  }, [cartItems]);

  // Function to add item to cart
  const addItem = useCallback((targetProduct: Omit<CartItem, 'quantity'>, addQuantity = 1) => {
    setCartItems((prevCart) => {
      // Check if item already exists in cart
      const isInCart = prevCart.find((item) => item.id === targetProduct.id);

      if (isInCart) { // If existing item, increase quantity
        return prevCart.map((item) =>
          item.id === targetProduct.id ? { ...item, quantity: item.quantity + addQuantity } : item
        );
      } else { // If new item, add it
        return [...prevCart, { ...targetProduct, quantity: addQuantity }];
      }
    });
  }, []);

  // Function to remove item from cart
  const removeItem = useCallback((targetId: string) => {
    setCartItems(prevCart => prevCart.filter(p => p.id !== targetId));
  }, []);

  // Function to clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Function to update item quantity
  const updateQuantity = useCallback((targetId: string, newQuantity: number) => {
    // Cart array
    setCartItems((prevCart) => {
      if (newQuantity > 0) { // Update only if quantity is 1 or more
        return prevCart.map((item) =>
          item.id === targetId ? { ...item, quantity: newQuantity } : item
        );
      } else { // Remove item from cart if quantity is 0 or less
        return prevCart.filter(item => item.id !== targetId);
      }
    });
  }, []);

  // Check if item with specified ID is in cart
  const isInCart = useCallback((targetId: string) => {
    return cartItems.some(p => p.id === targetId);
  }, [cartItems]);

  // Total amount of items in cart
  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  // Total quantity of items in cart
  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      addItem,
      removeItem,
      clearCart,
      updateQuantity,
      isInCart,
      totalPrice,
      totalQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
}

