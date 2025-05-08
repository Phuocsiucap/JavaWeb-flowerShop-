// src/components/admin/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  ChevronRight,
  LogOut,
  Bell,
  Flower
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    { title: "Tổng quan", icon: <LayoutDashboard size={20} />, path: "/admin" },
    { title: "Đơn hàng", icon: <ShoppingBag size={20} />, path: "/admin/orders" },
    { title: "Sản phẩm", icon: <Package size={20} />, path: "/admin/products" },
    { title: "Khách hàng", icon: <Users size={20} />, path: "/admin/customers" },
    { title: "Báo cáo", icon: <FileText size={20} />, path: "/admin/reports" },
    { title: "Cài đặt", icon: <Settings size={20} />, path: "/admin/settings" },
  ];

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    <div className={`bg-white shadow-lg h-screen ${collapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 transition-all duration-300`}>
      <div className="p-4 flex items-center justify-between border-b">
        <Link to="/admin" className="flex items-center">
          <Flower size={24} className="text-pink-500" />
          {!collapsed && <span className="ml-2 font-bold text-lg">Flower Admin</span>}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronRight size={20} className={`transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>
      
      <div className="py-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link 
                to={item.path} 
                className={`flex items-center px-4 py-3 ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Link to="/admin/profile" className={`flex items-center p-3 hover:bg-gray-50 rounded-lg ${!collapsed ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              A
            </div>
            {!collapsed && (
              <div className="ml-3">
                <div className="font-medium">Admin User</div>
                <div className="text-xs text-gray-500">admin@flowerstore.com</div>
              </div>
            )}
          </div>
          {!collapsed && <Settings size={18} className="text-gray-400" />}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;