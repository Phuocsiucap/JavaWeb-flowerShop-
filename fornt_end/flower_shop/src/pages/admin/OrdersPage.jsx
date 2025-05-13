import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, ArrowUpDown, Eye, Download } from 'lucide-react';
import AdminLayout from '../../components/admin/Layout';
import Cookies from 'js-cookie';

const OrdersPage = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = Cookies.get('token');
      try {
        const response = await axios.get(`http://localhost:8080/flower_shop/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Đảm bảo response.data là mảng (danh sách đơn hàng)
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          throw new Error('Dữ liệu trả về không phải là danh sách đơn hàng');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);

  const statusColors = {
    'Đã giao': 'bg-green-100 text-green-800',
    'Đang giao': 'bg-blue-100 text-blue-800',
    'Đang xử lý': 'bg-yellow-100 text-yellow-800',
    'Đã hủy': 'bg-red-100 text-red-800',
  };

  const paymentColors = {
    'Đã thanh toán': 'bg-green-100 text-green-800',
    'Chờ thanh toán': 'bg-yellow-100 text-yellow-800',
    'Hoàn tiền': 'bg-red-100 text-red-800',
  };

  const sortOrders = (orders) => {
    const sorted = [...orders];
    switch (sortOption) {
      case 'newest':
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-'));
          const dateB = new Date(b.date.split('/').reverse().join('-'));
          return sortOption === 'newest' ? dateB - dateA : dateA - dateB;
        });
      case 'priceHighToLow':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'priceLowToHigh':
        return sorted.sort((a, b) => a.amount - b.amount);
      default:
        return sorted;
    }
  };

  const filteredOrders = sortOrders(
    selectedTab === 'all'
      ? orders
      : orders.filter((o) => {
          const map = {
            processing: 'Đang xử lý',
            shipping: 'Đang giao',
            completed: 'Đã giao',
            cancelled: 'Đã hủy',
          };
          return o.status === map[selectedTab];
        })
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quản lý đơn hàng
          </h1>
          <button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 px-4 rounded-lg flex items-center hover:scale-105 transition-transform">
            <Download size={18} className="mr-1 animate-pulse" />
            Xuất báo cáo
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b px-4">
            <nav className="flex space-x-6 overflow-x-auto">
              {[
                { key: 'all', label: 'Tất cả', color: 'bg-gray-100', count: orders.length },
                { key: 'processing', label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
                { key: 'shipping', label: 'Đang giao', color: 'bg-blue-100 text-blue-800' },
                { key: 'completed', label: 'Đã giao', color: 'bg-green-100 text-green-800' },
                { key: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`py-4 px-1 relative ${
                    selectedTab === tab.key
                      ? 'text-blue-600 font-medium border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setSelectedTab(tab.key)}
                >
                  {tab.label}
                  <span
                    className={`absolute top-3 right-0 text-xs px-1.5 rounded-full animate-pulse ${
                      tab.color || ''
                    }`}
                  >
                    {tab.count ?? orders.filter((o) => o.status === tab.label).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 border-b flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm đơn hàng..."
                  className="pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button className="border rounded-lg px-3 py-2 flex items-center hover:bg-gray-100">
                <Filter size={18} className="mr-1" />
                <span>Lọc</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-500">Sắp xếp theo:</label>
              <select
                className="border rounded p-1 text-sm"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="priceHighToLow">Giá cao - thấp</option>
                <option value="priceLowToHigh">Giá thấp - cao</option>
              </select>
            </div>
          </div>

          {/* Loading & Error */}
          {loading && (
            <div className="p-4 text-center text-gray-500 animate-pulse">Đang tải đơn hàng...</div>
          )}
          {error && <div className="p-4 text-center text-red-500">Lỗi: {error}</div>}

          {/* Table */}
          {!loading && !error && (
            <>
              {filteredOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Không có đơn hàng nào phù hợp.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase flex items-center">
                          Mã đơn
                          <ArrowUpDown size={14} className="ml-1" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Khách hàng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase flex items-center">
                          Ngày đặt
                          <ArrowUpDown size={14} className="ml-1" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Thanh toán
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase flex items-center">
                          Tổng tiền
                          <ArrowUpDown size={14} className="ml-1" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-blue-600">{order.id}</td>
                          <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                          <td className="px-6 py-4 text-gray-700">{order.date}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                statusColors[order.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                paymentColors[order.payment] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.payment}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatPrice(order.amount)}
                            <div className="text-xs text-gray-400">{order.items} sản phẩm</div>
                          </td>
                          <td className="px-6 py-4">
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded flex items-center">
                              <Eye size={16} className="mr-1" />
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Pagination - giả lập */}
          <div className="px-6 py-3 flex items-center justify-between border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              Hiển thị 1–{Math.min(5, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border rounded hover:bg-gray-100">Trước</button>
              <button className="px-3 py-1 border rounded bg-blue-50 text-blue-600">1</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;