import React, { useState, useEffect, useContext } from 'react';
import  AdminContext  from '../../contexts/AdminContext';
import AppLayout from '../../components/admin/Layout';
import AlertNotification from '../../components/ui/AlertNotification';
import axios from '../../axiosInstance';
import Cookies from 'js-cookie';

const AdminProfilePage = () => {
  const { adminToken, logoutAdmin } = useContext(AdminContext);
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    role: '',
    name: '',
    address: '',
    phone: ''
  });

  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      const res = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const userData = res.data;
      setFormData({
        id: userData.id || '',
        email: userData.email || '',
        role: userData.role || '',
        name: userData.name || '',
        address: userData.address || '',
        phone: userData.phone || ''
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Không thể tải thông tin người dùng'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/auth/update-profile', {
        email: formData.email,
        name: formData.name,
        address: formData.address,
        phone: formData.phone
      }, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      setNotification({
        show: true,
        type: 'success',
        message: 'Cập nhật thông tin thành công!'
      });

      // Update the form data with the returned user info
      const userData = res.data.data.user;
      setFormData(prev => ({
        ...prev,
        ...userData
      }));
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin'
      });
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    // Chuyển hướng sẽ được xử lý bởi ProtectedAdminRoute
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {notification.show && (
        <AlertNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Thông tin cá nhân</h1>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Đăng xuất
              </button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò
                  </label>
                  <input
                    type="text"
                    value={formData.role === 'admin' ? 'Quản trị viên' : formData.role}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    disabled
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  >
                    Cập nhật thông tin
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminProfilePage;
