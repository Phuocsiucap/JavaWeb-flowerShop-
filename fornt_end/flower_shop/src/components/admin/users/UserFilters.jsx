// components/admin/users/UserFilters.js
import React from 'react';
import { Search } from 'lucide-react';

const UserFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  roleFilter, 
  setroleFilter, 
  statusFilter, 
  setStatusFilter 
}) => {
  return (
    <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
      {/* Search box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 p-2.5"
          placeholder="Tìm kiếm người dùng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* User type filter */}
      <select
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2.5"
        value={roleFilter}
        onChange={(e) => setroleFilter(e.target.value)}
      >
        <option value="all">Tất cả loại người dùng</option>
        <option value="admin">Quản trị viên</option>
        <option value="staff">Nhân viên</option>
        <option value="customer">Khách hàng</option>
      </select>
      
      {/* Status filter */}
      <select
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2.5"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="inactive">Không hoạt động</option>
        <option value="blocked">Đã khóa</option>
      </select>
    </div>
  );
};

export default UserFilters;