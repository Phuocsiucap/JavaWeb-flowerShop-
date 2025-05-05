import React, { forwardRef } from 'react';
import { Home, ShoppingBag, Clipboard, Users, BarChart2, LogOut } from 'lucide-react';

const Sidebar = forwardRef(({ sidebarOpen }, ref) => {
  return (
    <aside
      ref={ref} // Gán ref vào Sidebar
      className={`bg-gray-800 text-white w-64 h-screen fixed md:static z-40 transform transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 ${window.innerWidth < 768 ? 'absolute top-0' : ''}`}
    >
      <div className="p-4 relative">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center py-2 border-b border-gray-700">
            Quản lý cửa hàng
          </h2>
        </div>
        <nav>
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg" title="Trang chủ">
                <Home size={20} className="mr-3" />
                <span>Trang chủ</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg" title="Quản lý sản phẩm">
                <ShoppingBag size={20} className="mr-3" />
                <span>Quản lý sản phẩm</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg" title="Đơn hàng">
                <Clipboard size={20} className="mr-3" />
                <span>Đơn hàng</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg" title="Khách hàng">
                <Users size={20} className="mr-3" />
                <span>Khách hàng</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg" title="Thống kê">
                <BarChart2 size={20} className="mr-3" />
                <span>Thống kê</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="absolute bottom-0 w-full p-4">
        <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg" title="Đăng xuất">
          <LogOut size={20} className="mr-3" />
          <span>Đăng xuất</span>
        </a>
      </div>
    </aside>
  );
});

export default Sidebar;
