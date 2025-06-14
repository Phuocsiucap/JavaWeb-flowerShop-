import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, Eye, Download, X, Trash2, CheckCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/Layout';
import Cookies from 'js-cookie';
import { useAdmin } from '../../contexts/AdminContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import AlertNotification from '../../components/ui/AlertNotification';

const OrdersPage = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { verifyTokenAdmin, getUserById, getAllOrders, getOrderItems, updateOrderStatus, deleteOrder } = useAdmin();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = Cookies.get('adminToken');
        const valid = await verifyTokenAdmin(token);
        setIsTokenValid(valid);
        if (valid) {
          fetchOrders();
        } else {
          setNotification({
            show: true,
            type: 'error',
            message: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
          });
        }
      } catch (error) {
        console.error('Lỗi khi xác thực token:', error);
        setNotification({
          show: true,
          type: 'error',
          message: 'Lỗi xác thực. Vui lòng thử lại.',
        });
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, [verifyTokenAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersResponse = await getAllOrders();
      if (!ordersResponse.success) {
        throw new Error(ordersResponse.message);
      }

      const detailedOrders = await Promise.all(
        ordersResponse.data.map(async (o) => {
          let customerName = 'Ẩn danh';
          if (o.userId) {
            const customerResponse = await getUserById(o.userId);
            if (customerResponse && customerResponse.name) {
              customerName = customerResponse.name;
            }
          }
          let items = [];
          const itemsKey = `order_items_${o.orderId}`;
          const cachedItems = localStorage.getItem(itemsKey);
          if (cachedItems) {
            items = JSON.parse(cachedItems);
          }
          // Nếu không có items hoặc items rỗng, luôn gọi lại API để lấy mới
          if (!items || items.length === 0) {
            const itemsResponse = await getOrderItems(o.orderId);
            items = itemsResponse.success ? itemsResponse.data : [];
            localStorage.setItem(itemsKey, JSON.stringify(items));
          }
          const statusMap = {
            Pending: 'Đang xử lý',
            Shipping: 'Đang giao',
            Success: 'Thành công',
            Cancelled: 'Đã hủy',
          };
          const status = statusMap[o.status] || o.status;
          const paymentMap = {
            'Đang xử lý': 'Chờ xử lý',
            'Đang giao': 'Chờ thanh toán',
            'Thành công': 'Đã thanh toán',
            'Đã hủy': 'Hủy thanh toán',
          };
          return {
            id: o.orderId,
            customer: customerName,
            date: new Date(o.orderDate).toLocaleDateString('vi-VN'),
            status,
            payment: paymentMap[status],
            amount: o.totalAmount,
            items,
          };
        })
      );
      setOrders(detailedOrders);
      
    } catch (err) {
      console.error('Lỗi khi lấy đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

const handleConfirmOrder = async (orderId) => {
  const result = await Swal.fire({
    title: 'Xác nhận đơn hàng?',
    text: 'Trạng thái đơn hàng sẽ được chuyển sang "Đang giao".',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
  });

  if (result.isConfirmed) {
    try {
      const response = await updateOrderStatus(orderId, 'Shipping');
      if (response.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: 'Đang giao', payment: 'Chờ thanh toán' }
              : order
          )
        );
        setSelectedOrder((prev) =>
          prev && prev.id === orderId
            ? { ...prev, status: 'Đang giao', payment: 'Chờ thanh toán' }
            : prev
        );
        // Existing notification
        setNotification({
          show: true,
          type: 'success',
          message: response.message || 'Đơn hàng đã được xác nhận!',
        });
        // New SweetAlert2 success dialog
        await Swal.fire({
          title: 'Thành công!',
          text: response.message || 'Đơn hàng đã được xác nhận và chuyển sang trạng thái "Đang giao".',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: response.message || 'Không thể xác nhận đơn hàng!',
        });
        await Swal.fire({
          title: 'Lỗi!',
          text: response.message || 'Không thể xác nhận đơn hàng.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: err.message || 'Không thể xác nhận đơn hàng!',
      });
      await Swal.fire({
        title: 'Lỗi!',
        text: err.message || 'Không thể xác nhận đơn hàng.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
  };

  const handleDeleteOrder = async (orderId, status) => {
    if (status === 'Đang xử lý' || status === 'Đang giao') {
      setNotification({
        show: true,
        type: 'error',
        message: `Không thể xóa đơn hàng ở trạng thái ${status}!`,
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Bạn có muốn xóa đơn hàng không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa đơn hàng',
      cancelButtonText: 'Không',
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteOrder(orderId);
        if (response.success) {
          setOrders(orders.filter((order) => order.id !== orderId));
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
          setNotification({
            show: true,
            type: 'success',
            message: response.message || 'Xóa đơn hàng thành công!',
          });
        } else {
          setNotification({
            show: true,
            type: 'error',
            message: response.message || 'Không thể xóa đơn hàng!',
          });
        }
      } catch (err) {
        console.error('Lỗi khi xóa đơn hàng:', err);
        setNotification({
          show: true,
          type: 'error',
          message: err.message || 'Không thể xóa đơn hàng!',
        });
      }
    }
  };

  const handleExportPDF = () => {
    const input = document.getElementById('revenue-report-pdf');
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 20, 20, pdfWidth, pdfHeight);
      pdf.save('bao-cao-don-hang.pdf');
    });
    setNotification({
      show: true,
      type: 'success',
      message: 'Xuất báo cáo PDF thành công!',
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
    'Đang giao': 'bg-blue-100 text-blue-800',
    'Đã hủy': 'bg-red-100 text-red-800',
  };

  const paymentColors = {
    'Đã thanh toán': 'bg-green-100 text-green-800',
    'Chờ thanh toán': 'bg-blue-100 text-blue-800',
    'Chờ xử lý': 'bg-yellow-100 text-yellow-800',
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
            pending: 'Đang xử lý',
            shipping: 'Đang giao',
            success: 'Thành công',
            cancelled: 'Đã hủy',
          };
          return (
            o.status === map[selectedTab] &&
            o.customer.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
  );

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {notification.show && (
        <AlertNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quản lý đơn hàng
          </h1>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 px-4 rounded-lg flex items-center hover:scale-105 transition-transform"
            onClick={handleExportPDF}
          >
            <Download size={18} className="mr-2 animate-pulse" />
            Xuất báo cáo
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg" id="revenue-report-pdf">
          <div className="border-b px-4">
            <nav className="flex space-x-6 overflow-x-auto">
              {[
                { key: 'all', label: 'Tất cả', color: 'bg-gray-100', count: orders.length },
                { key: 'pending', label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
                { key: 'shipping', label: 'Đang giao', color: 'bg-blue-100 text-blue-800' },
                { key: 'success', label: 'Thành công', color: 'bg-green-100 text-green-800' },
                { key: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`py-4 px-4 relative ${
                    selectedTab === tab.key
                      ? 'text-blue-600 font-medium border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setSelectedTab(tab.key)}
                >
                  {tab.label}
                  <span
                    className={`absolute top-1 right-0 text-xs px-2 rounded-full animate-pulse ${
                      tab.color || ''
                    }`}
                  >
                    {tab.count ?? orders.filter((o) => o.status === tab.label).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khách hàng..."
                  className="pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sắp xếp theo:</label>
              <select
                className="border rounded-md p-2 text-sm"
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

          {!isTokenValid && (
            <div className="p-6 text-center text-red-500">
              Vui lòng đăng nhập để xem đơn hàng.
            </div>
          )}

          {isTokenValid && (
            <>
              {filteredOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Không có đơn hàng nào phù hợp.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 tracking-wider">
                          Mã đơn
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 tracking-wider">
                          Khách hàng
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 tracking-wider">
                          Ngày đặt
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 tracking-wider">
                          Thanh toán
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 tracking-wider">
                          Tổng tiền
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-blue-600">{order.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{order.customer}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{order.date}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                statusColors[order.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                paymentColors[order.payment] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.payment}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatPrice(order.amount)}
                            <div className="text-xs text-gray-400">{order.items.length} sản phẩm</div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openDetailsModal(order)}
                              className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            >
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

        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onDeleteOrder={handleDeleteOrder}
          onConfirmOrder={handleConfirmOrder}
          formatPrice={formatPrice}
        />
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;