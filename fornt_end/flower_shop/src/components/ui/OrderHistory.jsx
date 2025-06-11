import React, { useState, useEffect } from 'react';
import axios from '../../axiosInstance';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const OrderHistory = ({ orders, fetchUserOrders }) => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState(null);
  const [searchDate, setSearchDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(orders);

  const statusMap = {
    Pending: 'Đang xử lý',
    Shipping: 'Đang giao',
    Success: 'Thành công',
    Cancelled: 'Đã hủy',
  };

  // Update filteredOrders when orders change or when clearing filter
  useEffect(() => {
    setFilteredOrders(orders);
    // Debug: log all order statuses received from API
    if (orders && orders.length > 0) {
      console.log('Order statuses received from API:', orders.map(o => ({ id: o.id, status: o.status })));
    }
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

      const order = orders.find((o) => o.id === orderId);
      if (!order) throw new Error('Đơn hàng không tồn tại');

      // Allow transitions only from "Shipping" to "Success" or "Cancelled"
      if (order.status !== 'Shipping') {
        setError(`Không thể chuyển trạng thái từ "${statusMap[order.status] || order.status}" sang "${statusMap[newStatus] || newStatus}". Chỉ đơn hàng \"Đang giao\" mới được phép.`);
        return;
      }

      const updateResponse = await axios.put(
        `/api/customer/orders/update-status`,
        { orderId, status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (updateResponse.data.success) {
        fetchUserOrders(); // Refresh order list
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
      orders.filter((order) => {
        const orderDate = order.date.includes('/')
          ? order.date.split('/').reverse().join('-')
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

  // Placeholder image for missing or invalid imageUrl
  const placeholderImage = 'https://via.placeholder.com/50?text=No+Image';

  return (
    <div>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Date search filter */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:space-x-4 bg-gradient-to-r from-emerald-100 via-emerald-50 to-white p-6 rounded-2xl shadow-lg border border-emerald-100 animate-fade-in">
        <svg
          className="w-8 h-8 text-emerald-500 mr-3 mb-2 md:mb-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <label className="font-semibold text-emerald-700 mb-2 md:mb-0 text-lg">Tìm đơn hàng theo ngày:</label>
        <input
          type="date"
          className="border border-emerald-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700 shadow-sm transition-all duration-200 hover:border-emerald-500"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
        <button
          onClick={handleSearchByDate}
          className="ml-0 md:ml-2 mt-2 md:mt-0 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-transform px-6 py-2 rounded-full shadow-lg font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 group"
        >
          <svg
            className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <span className="text-emerald-700 font-semibold">Tìm kiếm</span>
        </button>
        {searchDate && (
          <button
            onClick={() => {
              setSearchDate('');
              setFilteredOrders(orders);
            }}
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
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-emerald-100">
              {filteredOrders.map((order) => {
                const statusVi = statusMap[order.status] || order.status;
                return (
                  <React.Fragment key={order.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusVi === 'Thành công'
                              ? 'bg-green-100 text-green-800'
                              : statusVi === 'Đã hủy'
                              ? 'bg-red-100 text-red-800'
                              : statusVi === 'Đang giao'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {statusVi}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 flex space-x-4">
                        <button onClick={() => handleViewDetails(order.id)} className="hover:text-emerald-800">
                          {selectedOrderId === order.id ? 'Đóng chi tiết' : 'Xem chi tiết'}
                        </button>
                      </td>
                    </tr>
                    {selectedOrderId === order.id && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 text-emerald-700">Chi tiết đơn hàng #{order.id}</h3>
                            <table className="min-w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Hình ảnh
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Mã sản phẩm
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Tên sản phẩm
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Số lượng
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Giá
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Tổng cộng
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {orderItems.length > 0 ? (
                                  orderItems.map((item, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-2">
                                        <img
                                          src={item.imageUrl || placeholderImage}
                                          alt={item.productName || 'Product Image'}
                                          className="w-12 h-12 object-cover rounded"
                                          onError={(e) => {
                                            e.target.src = placeholderImage;
                                          }}
                                        />
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-700">{item.productId || 'Unknown'}</td>
                                      <td className="px-4 py-2 text-sm text-gray-700">{item.productName || 'Unknown Product'}</td>
                                      <td className="px-4 py-2 text-sm text-gray-700">{item.quantity}</td>
                                      <td className="px-4 py-2 text-sm">{formatPrice(item.price)}</td>
                                      <td className="px-4 py-2 text-sm">{formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="6" className="px-4 py-2 text-center text-gray-600">
                                      Không tìm thấy sản phẩm.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            <div className="mt-6 flex space-x-4">
                              {order.status === 'Shipping' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'Success')}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                                    title="Chuyển trạng thái sang Thành công"
                                  >
                                    Thanh toán
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                                    title="Chuyển trạng thái sang Đã hủy"
                                  >
                                    Hủy đơn hàng
                                  </button>
                                </>
                              )}
                              {(order.status === 'Success') && (
                                <Link
                                  to={`/order/${order.id}/review`}
                                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
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
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Bạn chưa đặt đơn hàng nào.</p>
          <Link to="/products" className="text-emerald-600 hover:text-emerald-800">
            Duyệt sản phẩm của chúng tôi
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;