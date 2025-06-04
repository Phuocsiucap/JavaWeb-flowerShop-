import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import OrderHistory from '../components/ui/OrderHistory';
import Header from '../components/layout/Header';
import axios from '../axiosInstance';

const ProfilePage = () => {
  const { setInfo, currentUser, updateUserProfile, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    role: '',
    name: '',
    address: '',
    phone: ''
  });
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        id: currentUser.id || '',
        email: currentUser.email || '',
        role: currentUser.role || '',
        name: currentUser.name || '',
        address: currentUser.address || '',
        phone: currentUser.phone || ''
      });

      // Fetch user orders
      fetchUserOrders();
    }
  }, [currentUser]);

  const fetchUserOrders = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await axios.get(`/api/customer/orders/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        const userOrders = response.data.data.orders.map(order => ({
          id: order.orderId,
          date: new Date(order.orderDate).toLocaleDateString('en-CA'),
          total: order.totalAmount,
          status: order.status === 'Success' ? 'Thành công' :
                  order.status === 'Cancelled' ? 'Đã hủy' : 'Đang xử lý'
        }));
        setOrders(userOrders);
      } else {
        throw new Error(response.data.message || 'Không thể tải đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setAlert({
        show: true,
        type: 'error',
        message: `Không thể tải lịch sử đơn hàng: ${error.response?.data?.message || error.message}`
      });
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      setAlert({
        show: true,
        type: 'success',
        message: 'Đăng xuất thành công!'
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Đăng xuất thất bại. Vui lòng thử lại!'
      });
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div
            className="w-full min-h-screen bg-cover bg-center bg-no-repeat px-4 py-8 justify-center border-2 border-dashed border-black-500 rounded-lg"
            style={{ backgroundImage: 'url("bg_profile.jpg")' }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Please Login</h2>
              <p className="mb-4">You need to be logged in to view your profile.</p>
              <Link
                to="/login"
                className="bg-emerald-600 text-black bg-blue-500 border py-2 px-6 rounded-lg hover:bg-emerald-700"
              >
                Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div
          className="w-full min-h-screen bg-cover bg-center bg-no-repeat px-4 py-8 justify-center"
          style={{ backgroundImage: 'url("bg_profile.jpg")' }}
        >
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">My Profile</h1>
                <button
                  onClick={handleLogout}
                  className="text-red-600 border bg-orange-300 py-1 rounded-lg bg-emerald-600 px-2 hover:text-red-800"
                >
                  Logout
                </button>
              </div>

              <div className="mb-6">
                <div className="flex space-x-4 border-b">
                  <button
                    className={`py-2 px-4 ${activeTab === 'info' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('info')}
                  >
                    Personal Information
                  </button>
                  <button
                    className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    Order History
                  </button>
                </div>
              </div>

              {activeTab === 'info' && (
                <div>
                  <h2 className="text-xl font-medium mb-4">Personal Information</h2>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        disabled
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-emerald-600 text-black border bg-green-300 py-2 px-6 rounded-lg hover:bg-emerald-700"
                    >
                      Update Profile
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <OrderHistory orders={orders} fetchUserOrders={fetchUserOrders} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;