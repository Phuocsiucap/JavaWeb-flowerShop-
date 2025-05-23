
import React, { createContext, useContext, useState } from 'react';
import axios from '../axiosInstance';
import Cookies from 'js-cookie';

const AdminContext = createContext();


export const AdminProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  


  const verifyTokenAdmin = async () => {
    if (!adminToken) return false;
    return true;
  };

  const loginAdmin = async (email, password) => {
    if (email && password) {
      try {
        const res = await axios.post('/api/auth/login', { email, password });
        const data = res.data;
        console.log(data);
        const token = data.data.token;
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
      return res.data.data.users;
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
      console.log(res.data);
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
      // Only include password in the payload if it's provided
      const payload = {
        name: updatedData.fullName,
        email: updatedData.email,
        phone: updatedData.phone,
        role: updatedData.role,
        status: updatedData.status
      };
      
      // Add password only if it exists
      if (updatedData.password) {
        payload.password = updatedData.password;
      }
      console.log(payload);
      const res = await axios.put(`api/admin/management/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      return res.data.data.user;
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
      return res.data.success;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  };

  const value = {
    adminToken,
    verifyTokenAdmin,
    loginAdmin,
    logoutAdmin,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);

export default AdminContext;

