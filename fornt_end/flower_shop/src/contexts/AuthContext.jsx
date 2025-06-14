import React, { createContext, useState, useEffect } from 'react';
import axios from '../axiosInstance';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setInfo = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(res.data);
      } catch (error) {
        setCurrentUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setInfo();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    Cookies.set('token', res.data.data.token);
    setInfo();
    return res.data;
  };

  const register = async (email, password, name) => {
    const res = await axios.post('/api/auth/register', { email, password, name });
    return res.data;
  };

  const logout = async () => {
    setCurrentUser(null);
    const res = await axios.post('/api/auth/logout');
    Cookies.remove('token');
    return res.data;
  };

  const forgotPassword = async (email) => {
    return await axios.post('/api/auth/forgot-password', { email });
  };

  const updateUserProfile = async (userData) => {
    try {
      const token = Cookies.get('token');
      const res = await axios.put('/api/auth/update-profile', {
        email: userData.email,
        name: userData.name,
        address: userData.address,
        phone: userData.phone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(res.data.data.user);
      alert(res.data.message);
      return res.data.data.user;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  // Lấy danh sách đơn hàng của user
  const getUserOrders = async () => {
    try {
      const token = Cookies.get('token');
      if (!token || !currentUser?.id) return [];
      const res = await axios.get(`/api/orders/user/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        return res.data.data.orders.map((order) => ({
          id: order.orderId,
          date: new Date(order.orderDate).toLocaleDateString('en-CA'),
          total: order.totalAmount,
          status: order.status === 'Success' ? 'Thành công' : order.status === 'Cancelled' ? 'Đã hủy' : 'Đang xử lý',
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  };

  // Lấy chi tiết một đơn hàng
  const getDetailOrder = async (orderId) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }
      const res = await axios.get(`/api/customer/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        return res.data.data.order;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  };

  // Lấy danh sách sản phẩm trong đơn hàng
  const getOrderItems = async (orderId) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }
      const res = await axios.get(`/api/customer/orders/${orderId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data.items || [];
    } catch (error) {
      console.error(`Error fetching order items for ${orderId}:`, error);
      return [];
    }
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }
      const res = await axios.put(
        `/api/customer/orders/update-status`,
        { orderId, status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (res.data.success) {
        return true;
      }
      throw new Error(res.data.message || 'Cập nhật trạng thái thất bại');
    } catch (error) {
      console.error(`Error updating order status for ${orderId}:`, error);
      throw error;
    }
  };
  

  const value = {
    currentUser,
    setInfo,
    login,
    register,
    logout,
    forgotPassword,
    updateUserProfile,
    getUserOrders,
    getDetailOrder,
    getOrderItems,
    updateOrderStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};