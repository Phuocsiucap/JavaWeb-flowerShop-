// components/admin/users/UserActionButtons.js
import React from 'react';
import { UserPlus, Download, Upload } from 'lucide-react';

const UserActionButtons = ({ onAddUser }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onAddUser}
        className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
      >
        <UserPlus className="h-5 w-5 mr-2" />
        Thêm người dùng
      </button>
      
      <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
        <Download className="h-5 w-5 mr-2" />
        Xuất Excel
      </button>
      
      <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
        <Upload className="h-5 w-5 mr-2" />
        Nhập Excel
      </button>
    </div>
  );
};

export default UserActionButtons;