import React from 'react';
import AppLayout from '../../components/admin/AppLayout';

const AdminHome = () => {
  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>
        <p className="text-gray-600">Xem và quản lý tất cả các sản phẩm của cửa hàng hoa</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Nội dung chính</h3>
        <p className="text-gray-600">
          Đây là khu vực nội dung chính của trang quản lý sản phẩm. Bạn có thể thêm các bảng, biểu đồ hoặc form quản lý sản phẩm tại đây.
        </p>
        {/* Phần nội dung chính sẽ được bạn tự thêm vào */}
      </div>
    </AppLayout>
  );
};

export default AdminHome;