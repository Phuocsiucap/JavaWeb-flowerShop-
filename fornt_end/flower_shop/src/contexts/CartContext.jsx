import React, { createContext, useState, useEffect } from 'react';
import axios from '../axiosInstance'; // Đường dẫn phù hợp với project của bạn
import Cookies from 'js-cookie';
// Khởi tạo context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null); // Lưu Cart { cartId, shippingFee, userId }
  const [cartItems, setCartItems] = useState([]); // Lưu danh sách CartItem
  const [countItem, setCountItem] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const res = await axios.get('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Giả định res.data là { cart: { cartId, shippingFee, userId }, items: CartItem[] }
          setCart(res.data.cart || null);
          setCartItems(res.data.items || []);
          setCountItem(res.data.items?.length || 0);
        } catch (error) {
          console.error('Error fetching cart:', error);
          setCart(null);
          setCartItems([]);
        }
      }
      setLoading(false);
    };
  // Lấy giỏ hàng và items từ backend khi component mount
  useEffect(() => {
  

    fetchCart();
  }, []);

  // Thêm sản phẩm vào giỏ hàng
  // Sửa lại để nhận quantity động
  const addToCart = async (productId, quantity = 1) => {
     const token = Cookies.get('token');
     try {
       const response = await fetch('http://localhost:8080/flower_shop/api/cart/add', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({ productId, quantity }),
       });
 
       if (!response.ok) {
         throw new Error('Failed to add product to cart');
       }
 
      //  alert('Sản phẩm đã được thêm vào giỏ hàng!');
       fetchCart();
     } catch (err) {
       alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
     }
   };

  const updateItemQuantity = async (productId, quantity) => {
  const token = Cookies.get('token');
  try {
    if (!token) throw new Error('Vui lòng đăng nhập để cập nhật giỏ hàng');
    if (quantity < 1) throw new Error('Số lượng phải lớn hơn 0');

    const response = await fetch(`http://localhost:8080/flower_shop/api/cart/update/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update item quantity');
    }

    fetchCart();
  } catch (err) {
    alert('Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại sau.');
  }
};

const removeFromCart = async (productId) => {
  const token = Cookies.get('token');
  try {
    if (!token) throw new Error('Vui lòng đăng nhập để xóa sản phẩm');
    
    const response = await fetch(`http://localhost:8080/flower_shop/api/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove product from cart');
    }

    fetchCart();
  } catch (err) {
    alert('Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại sau.');
  }
};

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      const token = Cookies.get('token');
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
    countItem,
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