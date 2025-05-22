import React, { useState } from 'react';
import axios from '../../axiosInstance';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const OrderHistory = ({ orders, fetchUserOrders }) => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState(null);

  const fetchOrderItems = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/items`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/json',
        },
      });
      setOrderItems(response.data.data.items || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại!');
      setOrderItems([]);
    }
  };

  const handleViewDetails = (orderId) => {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
      setOrderItems([]);
    } else {
      setSelectedOrderId(orderId);
      fetchOrderItems(orderId);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Token không hợp lệ hoặc không tồn tại!');
        return;
      }

      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Đơn hàng không tồn tại');

      if (newStatus === 'Success' && order.status !== 'Đang xử lý') {
        setError('Không thể thanh toán đơn hàng. Chỉ đơn hàng "Đang xử lý" mới được thanh toán.');
        return;
      }
      if (newStatus === 'Cancelled' && order.status !== 'Đang xử lý') {
        setError('Không thể hủy đơn hàng. Chỉ đơn hàng "Đang xử lý" mới được hủy.');
        return;
      }

      // Sử dụng query parameter thay vì body
      const updateResponse = await axios.put(`/api/orders/update-status`, {
        orderId: orderId,
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (updateResponse.data.success) {
        fetchUserOrders(); // Cập nhật danh sách đơn hàng
        setSelectedOrderId(null);
        setOrderItems([]);
      } else {
        throw new Error(updateResponse.data.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại!');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  return (
    <div>
      <h2 className="text-xl font-medium mb-6">Order History</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Thành công' ? 'bg-green-100 text-green-800' :
                        order.status === 'Đã hủy' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 flex space-x-4">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="hover:text-emerald-800"
                      >
                        {selectedOrderId === order.id ? 'Close Details' : 'View Details'}
                      </button>
                      {order.status === 'Thành công' && (
                        <Link
                          to={`/order/${order.id}/review`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Đánh giá
                        </Link>
                      )}
                    </td>
                  </tr>
                  {selectedOrderId === order.id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold mb-4">Order Details #{order.id}</h3>
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Product Id
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Quantity
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Price
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {orderItems.length > 0 ? (
                                orderItems.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2">{item.productId || 'Unknown Product'}</td>
                                    <td className="px-4 py-2">{item.quantity}</td>
                                    <td className="px-4 py-2">{formatPrice(item.price)}</td>
                                    <td className="px-4 py-2">{formatPrice(item.price * item.quantity)}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                                    No products found.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          <div className="mt-4 flex space-x-4">
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'Success')}
                              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                              disabled={false}
                              title="Chỉ đơn hàng 'Đang xử lý' mới được thanh toán"
                            >
                              Thanh toán
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                              disabled={false}
                              title="Chỉ đơn hàng 'Đang xử lý' mới được hủy"
                            >
                              Hủy đơn hàng
                            </button>
                            {order.status === 'Thành công' && (
                              <Link
                                to={`/order/${order.id}/review`}
                                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                              >
                                Đánh giá
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="text-emerald-600 hover:text-emerald-800">
            Browse our products
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;