// components/admin/users/UserTable.js
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const UserTable = ({ users, onEditUser, onDeleteUser }) => {
  // Định dạng các status badges
  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Hoạt động</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Không hoạt động</span>;
      case 'blocked':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Đã khóa</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Định dạng các user type badges
  const getroleBadge = (role) => {
    switch(role) {
      case 'admin':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Quản trị viên</span>;
      case 'staff':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Nhân viên</span>;
      case 'customer':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Khách hàng</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{role}</span>;
    }
  };

  return (
    <div className="overflow-x-auto text-sx">
      <table className="min-w-full bg-white ">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại người dùng</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đăng nhập cuối</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={user.id}
                    readOnly
                    className="w-40 px-2 py-1 border rounded bg-gray-50 text-sm text-gray-800 cursor-text overflow-x-auto"
                  />
                </td>
                <td className="py-4 px-4 whitespace-nowrap">{user.name}</td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={user.email}
                    readOnly
                    className="w-40 px-2 py-1 border rounded bg-gray-50 text-sm text-gray-800 cursor-text overflow-x-auto"
                  />
                </td>
                <td className="py-4 px-4 whitespace-nowrap">{user.phone}</td>
                <td className="py-4 px-4 whitespace-nowrap">{getroleBadge(user.role)}</td>
                <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                <td className="py-4 px-4 whitespace-nowrap">{user.createdAt}</td>
                <td className="py-4 px-4 whitespace-nowrap">{user.lastLogin}</td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onEditUser(user)}
                      className="p-1 rounded-md text-blue-600 hover:bg-blue-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteUser(user)}
                      className="p-1 rounded-md text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="py-6 text-center text-gray-500">
                Không có dữ liệu người dùng
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;