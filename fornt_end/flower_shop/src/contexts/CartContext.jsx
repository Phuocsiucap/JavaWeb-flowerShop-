import React, { createContext, useState, useEffect } from 'react';
import axios from '../axiosInstance'; // Đường dẫn phù hợp với project của bạn

// Khởi tạo context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null); // Lưu Cart { cartId, shippingFee, userId }
  const [cartItems, setCartItems] = useState([]); // Lưu danh sách CartItem
  const [loading, setLoading] = useState(true);

  // Lấy giỏ hàng và items từ backend khi component mount
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Giả định res.data là { cart: { cartId, shippingFee, userId }, items: CartItem[] }
          setCart(res.data.cart || null);
          setCartItems(res.data.items || []);
        } catch (error) {
          console.error('Error fetching cart:', error);
          setCart(null);
          setCartItems([]);
        }
      }
      setLoading(false);
    };

    fetchCart();
  }, []);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (productId, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Vui lòng đăng nhập để thêm sản phẩm');

      const res = await axios.post(
        '/api/cart/add',
        { productId: productId.toString(), quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Cập nhật cart và items
      setCart(res.data.cart || null);
      setCartItems(res.data.items || []);
      return res.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Vui lòng đăng nhập để xóa sản phẩm');

      const res = await axios.delete(`/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.cart || null);
      setCartItems(res.data.items || []);
      return res.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateItemQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Vui lòng đăng nhập để cập nhật giỏ hàng');
      if (quantity < 1) throw new Error('Số lượng phải lớn hơn 0');

      const res = await axios.put(
        `/api/cart/update/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data.cart || null);
      setCartItems(res.data.items || []);
      return res.data;
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Vui lòng đăng nhập để xóa giỏ hàng');

      const res = await axios.delete('/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(null);
      setCartItems([]);
      return res.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  // Tính tổng số lượng và tổng giá từ cartItems
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const value = {
    cart,
    cartItems,
    totalItems,
    totalPrice,
    loading,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {!loading && children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = () => React.useContext(CartContext);