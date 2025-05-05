import React, { createContext, useState, useEffect} from 'react';

import axios from '../axiosInstance'; // đường dẫn phù hợp project của bạn

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const setInfo = async() => {
    const token = localStorage.getItem('token_admin');
    if (token) {
      try {
        const res = await axios.get('/api/admin/info', {
          headers:  {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentAdmin(res.data);
      } catch (error) {
        setCurrentAdmin(null);
      }
    }

    setLoading(false);
  };

    // ✅ Fetch thông tin người dùng khi AuthProvider khởi tạo
    useEffect(() => {
      setInfo();
    }, []); // Chỉ chạy một lần khi component mount

  const login = async (email, password) => {
    var res = await axios.post('/api/admin/login', { email, password });
    res = res.data; // Lấy dữ liệu từ response
    console.log(res); // Kiểm tra dữ liệu trả về từ server
    localStorage.setItem('token_admin', res.data.token); // Lưu token
    setInfo(); // Lấy thông tin người dùng
    // setCurrentUser(res.data.user); // Lưu thông tin người dùng
    return res.data;
  };


  const logout = async () => {
    localStorage.removeItem('token'); // Xóa token
    setCurrentAdmin(null);
    await axios.post('/api/admin/logout');
  };

 

  const value = {
    currentAdmin,
    setInfo,
    login,
    logout
  };

  return (
    <AdminContext.Provider value={value}>
      {!loading && children}
    </AdminContext.Provider>
  );
};