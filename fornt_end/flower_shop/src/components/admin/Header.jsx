import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from '../../axiosInstance.jsx';

import {
  Bell, Search, Flower, LayoutDashboard, ShoppingBag,
  Package, Users, FileText, Settings
} from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ name: '', email: '' });

  const adminToken = Cookies.get('adminToken');

  const menuItems = [
    { title: 'Tổng quan', icon: <LayoutDashboard size={18} />, path: '/admin' },
    { title: 'Đơn hàng', icon: <ShoppingBag size={18} />, path: '/admin/orders' },
    { title: 'Sản phẩm', icon: <Package size={18} />, path: '/admin/products' },
    { title: 'Khách hàng', icon: <Users size={18} />, path: '/admin/customers' },
    { title: 'Báo cáo', icon: <FileText size={18} />, path: '/admin/reports' },
    { title: 'Cài đặt', icon: <Settings size={18} />, path: '/admin/settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        setAdminInfo({
          name: res.data.name || '',
          email: res.data.email || ''
        });
      } catch (error) {
        console.error('Lỗi lấy thông tin admin:', error);
      }
    };
    if (adminToken) fetchAdminInfo();
  }, [adminToken]);

  const notifications = [
    { id: 1, title: "Đơn hàng mới", message: "Bạn có đơn hàng mới #ORD-7291", time: "5 phút trước", read: false },
    { id: 2, title: "Hàng sắp hết", message: "Hoa hồng đỏ sắp hết hàng (còn 5)", time: "30 phút trước", read: false },
    { id: 3, title: "Khách hàng mới", message: "Khách hàng mới đã đăng ký", time: "2 giờ trước", read: true },
  ];

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo + Menu */}
      <div className="flex items-center space-x-6">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <Flower size={24} className="text-pink-500" />
          <span className="font-bold text-lg">Flower Admin</span>
        </Link>
        <nav className="hidden md:flex space-x-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive(item.path) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{item.icon}</span> {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search + Notification + Profile */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-gray-100 relative"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-10">
              <div className="p-3 border-b flex justify-between items-center">
                <h3 className="font-medium">Thông báo</h3>
                <button className="text-sm text-blue-600">Đánh dấu đã đọc tất cả</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${notification.read ? '' : 'bg-blue-50'}`}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center">
                <button className="text-sm text-blue-600">Xem tất cả thông báo</button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Info */}
        <Link to="/admin/profile" className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center">
            {adminInfo.name ? adminInfo.name[0].toUpperCase() : 'A'}
          </div>
          <div className="text-sm hidden md:block">
            <div className="font-medium">
              {(adminInfo.name.length > 12 ? adminInfo.name.slice(0, 12) + '...' : adminInfo.name) || 'Admin'}
            </div>
            <div className="text-xs text-gray-500">
              {(adminInfo.email.length > 18 ? adminInfo.email.slice(0, 18) + '...' : adminInfo.email) || 'email@example.com'}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
