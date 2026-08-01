import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);

  // Fetch cart on login
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setCoupon(null);
    }
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cart');
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Error fetching cart', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to add items to cart.');
    }
    try {
      const res = await api.post('/api/cart', { productId, quantity });
      setCartItems(res.data.items || []);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to add item to cart';
      throw new Error(errMsg);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put('/api/cart', { productId, quantity });
      setCartItems(res.data.items || []);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update quantity';
      throw new Error(errMsg);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/api/cart/${productId}`);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/cart');
      setCartItems([]);
      setCoupon(null);
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const applyCoupon = async (code) => {
    setCouponError(null);
    try {
      const res = await api.post('/api/coupons/validate', { couponCode: code });
      setCoupon(res.data.coupon);
      return res.data.coupon;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid or expired coupon';
      setCouponError(errMsg);
      throw new Error(errMsg);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  // Calculations
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = (item.product.discountPrice && item.product.discountPrice > 0) ? item.product.discountPrice : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  };

  const getDiscount = () => {
    if (!coupon) return 0;
    const subtotal = getSubtotal();
    if (coupon.discountType === 'percentage') {
      return subtotal * (coupon.discountValue / 100);
    } else {
      return Math.min(coupon.discountValue, subtotal);
    }
  };

  const getDeliveryFee = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0 || subtotal > 35) return 0; // Free delivery over ₹35
    return 4.99;
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount() + getDeliveryFee());
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        coupon,
        couponError,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        subtotal: getSubtotal(),
        discount: getDiscount(),
        deliveryFee: getDeliveryFee(),
        total: getTotal(),
        cartCount: getCartCount()
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
