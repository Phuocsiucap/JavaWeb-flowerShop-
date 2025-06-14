import React, { createContext, useContext, useState } from 'react';
import axios from '../axiosInstance';
import Cookies from 'js-cookie';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [userinfo, setUserinfo] = useState(null);
  const [adminToken, setAdminToken] = useState(Cookies.get('adminToken') || null);

  const verifyTokenAdmin = async (adminToken) => {
    if (adminToken) {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(res.data);
      if (res.data.role === "customer") {
        Cookies.remove('adminToken');
        return false;
      }
      return true;
    }
    return false;
  };

  const loginAdmin = async (email, password) => {
    if (email && password) {
      try {
        const res = await axios.post('/api/auth/login', { email, password });
        console.log(email, password);
        const data = res.data;
        console.log(data);
        const token = data.data.token;

        const isValid = await verifyTokenAdmin(token);
        if (!isValid) {
          console.log("Token is valid");
          return false;
        }
        
        console.log("data", data);
        setAdminToken(token);
        Cookies.set('adminToken', token);
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    Cookies.remove('adminToken');
  };

  // API methods
  const getAllUsers = async (filters = {}) => {
    try {
      const res = await axios.get('api/admin/management/users/', {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: filters
      });
      // Đảm bảo luôn trả về mảng
      if (res.data && res.data.data && Array.isArray(res.data.data.users)) {
        return res.data.data.users;
      }
      return [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  const getUserById = async (userId) => {
    try {
      const res = await axios.get(`api/admin/management/users/${userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      return res.data.data.user;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  const createUser = async (userData) => {
    try {
      const res = await axios.post('api/admin/management/users', {
        name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (res.data.success) {
        return {
          success: true,
          message: res.data.message,
          user: res.data.data.user
        };
      } else {
        return {
          success: false,
          message: res.data.message || 'Có lỗi xảy ra'
        };
      }
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng'
      };
    }
  };

  const updateUser = async (userId, updatedData) => {
    try {
      const payload = {
        name: updatedData.fullName,
        email: updatedData.email,
        phone: updatedData.phone,
        role: updatedData.role,
        address: updatedData.address,
        status: updatedData.status
      };
      if (updatedData.password) {
        payload.password = updatedData.password;
      }
      console.log(payload);
      const res = await axios.put(`api/admin/management/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      return res.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const res = await axios.delete(`api/admin/management/users/${userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  };

const getAllOrders = async (filters = {}) => {
    if (!adminToken) {
      return { success: false, message: 'Chưa đăng nhập', data: [] };
    }
    try {
      const res = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: filters,
      });
      return {
        success: true,
        message: 'Lấy danh sách đơn hàng thành công',
        data: res.data.data.orders || [],
      };
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách đơn hàng',
        data: [],
      };
    }
  };

  const getOrderItems = async (orderId) => {
    if (!adminToken) {
      return { success: false, message: 'Chưa đăng nhập', data: [] };
    }
    if (!orderId) {
      return { success: false, message: 'Thiếu orderId', data: [] };
    }
    try {
      const res = await axios.get(`/api/admin/orders/${orderId}/items`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return {
        success: true,
        message: 'Lấy danh sách mặt hàng thành công',
        data: res.data.data.items || [],
      };
    } catch (error) {
      console.error(`Lỗi khi lấy mặt hàng cho đơn hàng ${orderId}:`, error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách mặt hàng',
        data: [],
      };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!adminToken) {
      return { success: false, message: 'Chưa đăng nhập' };
    }
    if (!orderId || !status) {
      return { success: false, message: 'Thiếu orderId hoặc status' };
    }
    try {
      const res = await axios.put(
        `/api/admin/orders/update-status`,
        { orderId, status },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      return {
        success: res.data.success,
        message: res.data.message || 'Cập nhật trạng thái đơn hàng thành công',
        data: res.data.data,
      };
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái đơn hàng ${orderId}:`, error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng',
      };
    }
  };

  const deleteOrder = async (orderId) => {
    if (!adminToken) {
      return { success: false, message: 'Chưa đăng nhập' };
    }
    if (!orderId) {
      return { success: false, message: 'Thiếu orderId' };
    }
    try {
      const res = await axios.delete(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return {
        success: res.data.success,
        message: res.data.message || 'Xóa đơn hàng thành công',
        data: { orderId: res.data.data?.orderId },
      };
    } catch (error) {
      console.error(`Lỗi khi xóa đơn hàng ${orderId}:`, error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xóa đơn hàng',
      };
    }
  };

  const getRevenueData = async () => {
    if (!adminToken) {
      return { success: false, message: 'Chưa đăng nhập', data: { revenue: [], topCustomers: [], bestSeller: null } };
    }
    try {
      const res = await axios.get('/api/revenue', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.data.error) {
        throw new Error(res.data.error || 'Lỗi khi lấy dữ liệu doanh thu');
      }
      return {
        success: true,
        message: '', // Removed success message as requested
        data: res.data || { revenue: [], topCustomers: [], bestSeller: null },
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu doanh thu:', error.response?.data?.error || error.message);
      return {
        success: false,
        message: error.response?.data?.error || 'Không thể lấy dữ liệu doanh thu',
        data: { revenue: [], topCustomers: [], bestSeller: null },
      };
    }
  };

  const value = {
    adminToken,
    userinfo,
    verifyTokenAdmin,
    loginAdmin,
    logoutAdmin,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllOrders,
    getOrderItems,
    updateOrderStatus,
    deleteOrder,
    getRevenueData,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);

export default AdminContext;