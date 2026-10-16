import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    grandTotal: 0,
  });
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Fetch user's persistent cart from server
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({
        items: [],
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        grandTotal: 0,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setCartError(err.response?.data?.message || 'Could not load your shopping cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    setCartError(null);
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.data);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      setCartError(msg);
      return { success: false, message: msg };
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    setCartError(null);
    try {
      const res = await api.put(`/cart/items/${productId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.data);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      setCartError(msg);
      return { success: false, message: msg };
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    setCartError(null);
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      if (res.data.success) {
        setCart(res.data.data);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      setCartError(msg);
      return { success: false, message: msg };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    setCartError(null);
    try {
      const res = await api.delete('/cart');
      if (res.data.success) {
        setCart(res.data.data);
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartError,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
