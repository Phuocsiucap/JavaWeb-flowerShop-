import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from '../../contexts/AuthContext';
import CustomerOrderModal from '../admin/users/CustomerOrderModal';

const OrderHistory = ({ orders, fetchUserOrders }) => {
  const { getOrderItems, updateOrderStatus } = useContext(AuthContext);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState(null);
  const [searchDate, setSearchDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [successMsg, setSuccessMsg] = useState(null);

  const statusMap = {
    Pending: 'Đang xử lý',
    Shipping: 'Đang giao',
    Success: 'Thành công',
    Cancelled: 'Đã hủy',
  };

  useEffect(() => {
    setFilteredOrders(orders);
    if (orders && orders.length > 0) {
      console.log('Order statuses received from API:', orders.map((o) => ({ id: o.id, status: o.status })));
    }
  }, [orders]);

  const fetchOrderItems = async (orderId) => {
    try {
      const items = await getOrderItems(orderId);
      setOrderItems(items || []);
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
      if (order.status !== 'Shipping') {
        setError(
          `Không thể chuyển trạng thái từ "${statusMap[order.status] || order.status}" sang "${
            statusMap[newStatus] || newStatus
          }". Chỉ đơn hàng "Đang giao" mới được phép.`
        );
        return;
      }
      await updateOrderStatus(orderId, newStatus);
      fetchUserOrders();
      setSelectedOrderId(null);
      setOrderItems([]);
      setSuccessMsg(newStatus === 'Success' ? 'Thanh toán thành công!' : 'Đơn hàng đã được hủy!');
      setTimeout(() => setSuccessMsg(null), 3000);
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

  const placeholderImage = 'https://via.placeholder.com/50?text=No+Image';

  return (
    <div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {successMsg && <div className="text-green-600 mb-4 font-semibold">{successMsg}</div>}

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
                  <tr key={order.id}>
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
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
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

      <CustomerOrderModal
        isOpen={!!selectedOrderId}
        onClose={() => {
          setSelectedOrderId(null);
          setOrderItems([]);
        }}
        order={filteredOrders.find((o) => o.id === selectedOrderId)}
        orderItems={orderItems}
        handleUpdateStatus={handleUpdateStatus}
        formatPrice={formatPrice}
      />
    </div>
  );
};

export default OrderHistory;