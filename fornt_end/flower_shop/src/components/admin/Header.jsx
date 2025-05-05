import React from 'react';
import { Search, Bell, Settings, Menu, X } from 'lucide-react';

const Header = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-4 md:hidden">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-xl font-bold">Flower Shop</h1>
        </div>
        <div className="flex items-center">
          <div className="relative mr-4 hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="px-3 py-1 text-sm rounded-lg text-gray-700 pl-8 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <Search size={16} className="absolute left-2 top-2 text-gray-500" />
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative p-1 rounded-full hover:bg-green-500">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-1 rounded-full hover:bg-green-500">
              <Settings size={20} />
            </button>
            <div className="ml-3">
              <div className="w-8 h-8 rounded-full bg-green-300 flex items-center justify-center text-green-800 font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;