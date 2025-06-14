import React from 'react';
import { Link } from 'react-router-dom';

const RecentOrdersTable = ({ orders }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Thành công": return "bg-green-100 text-green-800";
      case "Đang xử lý": return "bg-yellow-100 text-yellow-800";
      case "Đã hủy": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "Success": return "Thành công";
      case "Pending": return "Đang xử lý";
      case "Cancelled": return "Đã hủy";
      default: return status;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Đơn hàng gần đây</h2>
        <Link to="/admin/orders" className="text-blue-600 hover:underline text-sm">Xem tất cả</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.orderId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.orderId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.customer?.name ? order.customer.name : "Ẩn danh"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(translateStatus(order.status))}`}>
                    {translateStatus(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.totalAmount.toLocaleString('vi-VN')} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
