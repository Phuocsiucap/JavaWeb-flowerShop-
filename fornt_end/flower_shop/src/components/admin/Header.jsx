// src/components/admin/Header.jsx
import React, { useState } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notifications = [
    { 
      id: 1, 
      title: "Đơn hàng mới", 
      message: "Bạn có đơn hàng mới #ORD-7291", 
      time: "5 phút trước",
      read: false
    },
    { 
      id: 2, 
      title: "Hàng sắp hết", 
      message: "Hoa hồng đỏ sắp hết hàng (còn 5)", 
      time: "30 phút trước",
      read: false
    },
    { 
      id: 3, 
      title: "Khách hàng mới", 
      message: "Khách hàng mới đã đăng ký", 
      time: "2 giờ trước",
      read: true
    },
  ];
  
  return (
    <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-1 rounded-full hover:bg-gray-100 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>
      
      <div className="flex items-center">
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
      </div>
    </header>
  );
};

export default Header;