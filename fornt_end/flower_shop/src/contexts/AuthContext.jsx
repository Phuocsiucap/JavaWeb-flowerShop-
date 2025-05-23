import React, { createContext, useState, useEffect} from 'react';

import axios from '../axiosInstance'; // đường dẫn phù hợp project của bạn

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const setInfo = async() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get('/api/auth/me', {
          headers:  {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentUser(res.data);
      } catch (error) {
        setCurrentUser(null);
      }
    }

    setLoading(false);
  };

    // ✅ Fetch thông tin người dùng khi AuthProvider khởi tạo
    useEffect(() => {
      setInfo();
    }, []); // Chỉ chạy một lần khi component mount

  const login = async (email, password) => {
    var res = await axios.post('/api/auth/login', { email, password });
    res = res.data; // Lấy dữ liệu từ response
    console.log(res); // Kiểm tra dữ liệu trả về từ server
    localStorage.setItem('token', res.data.token); // Lưu token
    setInfo(); // Lấy thông tin người dùng
    // setCurrentUser(res.data.user); // Lưu thông tin người dùng
    return res.data;
  };

  const register = async (email, password, name) => {
    const res = await axios.post('/api/auth/register', { email, password, name });
    // localStorage.setItem('token', res.data.token); // Lưu token
    // setCurrentUser(res.data.user); // Lưu thông tin người dùng
    return res.data;
  };

  const logout = async () => {

    const token = Cookies.get('token');

    setCurrentUser(null);
    await axios.post('/api/auth/logout', {
      headers:  {
        Authorization: `Bearer ${token}`
      }    
    }); Cookies.remove('token'); // Xóa token
  };

  const forgotPassword = async (email) => {
    return await axios.post('/api/auth/forgot-password', { email });
  };

  const updateUserProfile = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/auth/update-profile', {
        "email": userData.email,
        "name": userData.name,
        "address": userData.address,
        "phone": userData.phone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(res.data.data.user);
      console.log(res.data); // Kiểm tra dữ liệu trả về từ server
      alert(res.data.message); // Hiển thị thông báo từ server
      return res.data.data.user; // Trả về dữ liệu người dùng đã cập nhật
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    forgotPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};