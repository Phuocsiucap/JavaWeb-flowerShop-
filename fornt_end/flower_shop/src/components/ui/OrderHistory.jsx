import React, { useState } from 'react';
import axios from '../../axiosInstance';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const OrderHistory = ({ orders, fetchUserOrders }) => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [filteredOrders, setFilteredOrders] = useState(orders);

  // Cập nhật filteredOrders khi orders thay đổi hoặc khi xóa lọc
  React.useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const fetchOrderItems = async (orderId) => {
    try {
      const response = await axios.get(`/api/customer/orders/${orderId}/items`, {
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
      const updateResponse = await axios.put(`/api/customer/orders/update-status`, {
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

  const handleSearchByDate = () => {
    if (!searchDate) {
      setFilteredOrders(orders);
      return;
    }
    setFilteredOrders(
      orders.filter(order => {
        // Giả sử order.date là dạng 'dd/MM/yyyy' hoặc 'yyyy-MM-dd'
        const orderDate = order.date.includes("/")
          ? order.date.split("/").reverse().join("-")
          : order.date;
        return orderDate.startsWith(searchDate);
      })
    );
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  return (
    <div>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Bộ lọc tìm kiếm theo ngày tháng năm */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:space-x-4 bg-gradient-to-r from-emerald-100 via-emerald-50 to-white p-6 rounded-2xl shadow-lg border border-emerald-100 animate-fade-in">
        <svg className="w-8 h-8 text-emerald-500 mr-3 mb-2 md:mb-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <label className="font-semibold text-emerald-700 mb-2 md:mb-0 text-lg">Tìm đơn hàng theo ngày:</label>
        <input
          type="date"
          className="border border-emerald-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700 shadow-sm transition-all duration-200 hover:border-emerald-500"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
        />
        <button
          onClick={handleSearchByDate}
          className="ml-0 md:ml-2 mt-2 md:mt-0 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-transform px-6 py-2 rounded-full shadow-lg font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 group"
        >
          <svg className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
          <span className="text-emerald-700 font-semibold">Tìm kiếm</span>
        </button>
        {searchDate && (
          <button
            onClick={() => { setSearchDate(''); setFilteredOrders(orders); }}
            className="ml-2 text-emerald-700 underline hover:text-emerald-900 font-medium"
          >
            Xóa lọc
          </button>
        )}
      </div>

      {filteredOrders.length > 0 ? (
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
          <table className="min-w-full divide-y divide-emerald-200">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-emerald-100">
              {filteredOrders.map((order) => (
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 flex space-x-4">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="hover:text-emerald-800"
                      >
                        {selectedOrderId === order.id ? 'Close Details' : 'View Details'}
                      </button>
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
                            {order.status === 'Đang xử lý' && (
                              <>
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
                              </>
                            )}
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