import React, { createContext, useContext, useState } from 'react';
import Cookies from 'js-cookie';
// Khởi tạo context
const AdminContext = createContext();

// Provider component
export const AdminProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(Cookies.get('adminToken') || null);

  // Hàm kiểm tra token admin
  const verifyTokenAdmin = async () => {
    if (!adminToken) return false;

    try {
      // Giả lập gọi API để kiểm tra token
      // Thay thế đoạn này bằng API thật nếu có
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Giả lập: token hợp lệ nếu nó tồn tại
          resolve({ success: adminToken !== null });
        }, 1000);
      });

      if (response.success) {
        return true;
      } else {
        setAdminToken(null);
        Cookies.remove('adminToken');
        return false;
      }
    } catch (error) {
      console.error('Error verifying admin token:', error);
      setAdminToken(null);
      Cookies.remove('adminToken');
      return false;
    }
  };

  // Hàm đăng nhập admin (giả lập)
  const loginAdmin = async (username, password) => {
    try {
      // Giả lập gọi API đăng nhập
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Giả lập: đăng nhập thành công nếu username là 'admin' và password là 'password'
          if (username === 'admin' && password === 'password') {
            resolve({ success: true, token: 'fake-admin-token' });
          } else {
            resolve({ success: false });
          }
        }, 1000);
      });

      if (response.success) {
        setAdminToken(response.token);
        Cookies.set('adminToken', response.token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error logging in admin:', error);
      return false;
    }
  };

  // Hàm đăng xuất admin
  const logoutAdmin = () => {
    setAdminToken(null);
    Cookies.remove('adminToken');
  };

  const value = {
    adminToken,
    verifyTokenAdmin,
    loginAdmin,
    logoutAdmin,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook để sử dụng AdminContext
export const useAdmin = () => useContext(AdminContext);

export default AdminContext;