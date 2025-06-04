import React, { useState, useEffect } from 'react';
import axios from '../../axiosInstance';
import { Search, ArrowUpDown, Eye, Download, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/Layout';
import Cookies from 'js-cookie';
import { useAdmin } from '../../contexts/AdminContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const OrdersPage = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { getUserById, adminToken, deleteOrder } = useAdmin();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = Cookies.get('adminToken');
      try {
        const response = await axios.get(`/api/admin/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const detailedOrders = await Promise.all(
          response.data.data.orders.map(async (o) => {
            const customer = o.userId ? await getUserById(o.userId) : null;
            const statusMap = {
              Pending: 'Đang xử lý',
              Success: 'Thành công',
              Cancelled: 'Đã hủy',
            };
            const status = statusMap[o.status] || o.status;
            const paymentMap = {
              'Đang xử lý': 'Chờ thanh toán',
              'Thành công': 'Đã thanh toán',
              'Đã hủy': 'Hủy thanh toán',
            };
            return {
              id: o.orderId,
              customer: customer?.name || 'Ẩn danh',
              date: new Date(o.orderDate).toLocaleDateString('vi-VN'),
              status,
              payment: paymentMap[status],
              amount: o.totalAmount,
              items: o.items || [], // Lưu luôn danh sách sản phẩm
            };
          })
        );
        setOrders(detailedOrders);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [getUserById, adminToken]);

  const handleCancelOrder = async (orderId, status) => {
    if (status === 'Đang xử lý') {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể hủy đơn hàng đang xử lý!',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Bạn có muốn hủy đơn hàng không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hủy đơn hàng',
      cancelButtonText: 'Không',
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteOrder(orderId);
        if (response.success) {
          setOrders(orders.filter((order) => order.id !== orderId));
          Swal.fire({
            icon: 'success',
            title: 'Đã hủy',
            text: response.message,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: response.message || 'Không thể hủy đơn hàng!',
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: err.message || 'Không thể hủy đơn hàng!',
        });
      }
    }
  };

  const handleExportPDF = () => {
    const input = document.getElementById('revenue-report-pdf');
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 20, 20, pdfWidth, pdfHeight);
      pdf.save('bao-cao-doanh-thu.pdf');
    });
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  const statusColors = {
    'Thành công': 'bg-green-100 text-green-800',
    'Đang xử lý': 'bg-yellow-100 text-yellow-800',
    'Đã hủy': 'bg-red-100 text-red-800',
  };

  const paymentColors = {
    'Đã thanh toán': 'bg-green-100 text-green-800',
    'Chờ thanh toán': 'bg-yellow-100 text-yellow-800',
    'Hủy thanh toán': 'bg-red-100 text-red-800',
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
      ? orders.filter((o) => o.customer.toLowerCase().includes(searchQuery.toLowerCase()))
      : orders.filter((o) => {
          const map = {
            processing: 'Đang xử lý',
            success: 'Thành công',
            cancelled: 'Đã hủy',
          };
          return (
            o.status === map[selectedTab] &&
            o.customer.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quản lý đơn hàng
          </h1>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 px-4 rounded-lg flex items-center hover:scale-105 transition-transform"
            onClick={handleExportPDF}
          >
            <Download size={18} className="mr-1 animate-pulse" />
            Xuất báo cáo
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg" id="revenue-report-pdf">
          <div className="border-b px-4">
            <nav className="flex space-x-6 overflow-x-auto">
              {[
                { key: 'all', label: 'Tất cả', color: 'bg-gray-100', count: orders.length },
                { key: 'processing', label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
                { key: 'success', label: 'Thành công', color: 'bg-green-100 text-green-800' },
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

          <div className="p-4 border-b flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tên khách hàng..."
                  className="pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
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

          {loading && (
            <div className="p-4 text-center text-gray-500 animate-pulse">Đang tải đơn hàng...</div>
          )}
          {error && <div className="p-4 text-center text-red-500">Lỗi: {error}</div>}

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
                        <React.Fragment key={order.id}>
                          <tr className="hover:bg-gray-50">
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
                              <div className="text-xs text-gray-400">{order.items.length} sản phẩm</div>
                            </td>
                            <td className="px-6 py-4 flex space-x-2">
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded flex items-center"
                                onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                              >
                                <Eye size={16} className="mr-1" />
                                Chi tiết
                              </button>
                              <button
                                className="p-1 text-red-600 hover:bg-red-50 rounded flex items-center"
                                onClick={() => handleCancelOrder(order.id, order.status)}
                              >
                                <Trash2 size={16} className="mr-1" />
                                Hủy
                              </button>
                            </td>
                          </tr>
                          {selectedOrderId === order.id && (
                            <tr>
                              <td colSpan="7" className="px-6 py-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h3 className="text-lg font-semibold mb-4">Chi tiết đơn hàng #{order.id}</h3>
                                  <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Mã sản phẩm
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Số lượng
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Giá
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Tổng
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {order.items.length > 0 ? (
                                        order.items.map((item, index) => (
                                          <tr key={index}>
                                            <td className="px-4 py-2">{item.productId || 'Không rõ tên'}</td>
                                            <td className="px-4 py-2">{item.quantity}</td>
                                            <td className="px-4 py-2">{formatPrice(item.price)}</td>
                                            <td className="px-4 py-2">{formatPrice(item.price * item.quantity)}</td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                                            Không có sản phẩm nào.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

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