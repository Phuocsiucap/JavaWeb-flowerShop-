import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const CustomerOrderModal = ({ isOpen, onClose, order, orderItems, handleUpdateStatus, formatPrice }) => {
  const placeholderImage = 'https://via.placeholder.com/50?text=No+Image';

  if (!isOpen || !order) return null;

  const statusMap = {
    Pending: 'Đang xử lý',
    Shipping: 'Đang giao',
    Success: 'Thành công',
    Cancelled: 'Đã hủy',
  };

  const statusVi = statusMap[order.status] || order.status;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết đơn hàng #{order.id}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn giá
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems && orderItems.length > 0 ? (
                  orderItems.map((item, index) => (
                    <tr key={item.productId || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={item.imageUrl || placeholderImage}
                          alt={item.productName || 'Hình ảnh sản phẩm'}
                          className="w-12 h-12 object-cover rounded-md"
                          onError={(e) => { e.target.src = placeholderImage; }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.productId || 'Không xác định'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.productName || 'Không xác định'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatPrice(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
            {order.status === 'Shipping' && (
              <>
                <button
                  onClick={() => handleUpdateStatus(order.id, 'Success')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                  title="Chuyển trạng thái sang Thành công"
                >
                  Thanh toán
                </button>
                <button
                  onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                  title="Chuyển trạng thái sang Đã hủy"
                >
                  Hủy đơn hàng
                </button>
              </>
            )}
            {order.status === 'Success' && (
              <Link
                to={`/order/${order.id}/review`}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
              >
                Đánh giá
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderModal;