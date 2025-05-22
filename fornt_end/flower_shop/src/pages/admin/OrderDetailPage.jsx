import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/admin/Layout';
import { formatPrice } from '../../utils/formatPrice';
import axios from '../../axiosInstance';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/admin/orders/${id}`);
        setOrder(response.data);
        setStatus(response.data.status);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    // Chỉ cập nhật nếu trạng thái thay đổi
    if (newStatus === status) return;
    
    setUpdating(true);
    try {
      await axios.patch(`/api/orders/${id}`, { status: newStatus });
      setStatus(newStatus);
      setOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
      
      // Hiển thị thông báo thành công
      setNotification({
        show: true,
        type: 'success',
        message: 'Cập nhật trạng thái đơn hàng thành công!'
      });
      
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Cập nhật trạng thái thất bại: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setUpdating(false);
    }
  };

  // Hàm render badge trạng thái với màu sắc tương ứng
  const renderStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-indigo-100 text-indigo-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Lỗi: {error}</p>
              <button 
                onClick={() => navigate('/admin/orders')} 
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Quay lại danh sách đơn hàng
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Không tìm thấy đơn hàng.</p>
              <button 
                onClick={() => navigate('/admin/orders')} 
                className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
              >
                Quay lại danh sách đơn hàng
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        {/* Thanh điều hướng */}
        <nav className="flex mb-5" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/admin/dashboard" className="text-gray-700 hover:text-pink-600">
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                <Link to="/admin/orders" className="ml-1 text-gray-700 hover:text-pink-600 md:ml-2">
                  Đơn hàng
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                <span className="ml-1 text-gray-500 md:ml-2">Chi tiết đơn #{order.id}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Thông báo */}
        {notification.show && (
          <div className={`p-4 mb-4 ${notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'} border-l-4`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thông tin khách hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Thông tin khách hàng</h3>
                <div>{renderStatusBadge(status)}</div>
              </div>
              <div className="space-y-3">
                <p><span className="font-medium text-gray-500">Tên khách hàng:</span> {order.customer.name}</p>
                <p><span className="font-medium text-gray-500">Email:</span> {order.customer.email}</p>
                <p><span className="font-medium text-gray-500">Địa chỉ:</span> {order.shippingAddress}</p>
                <p><span className="font-medium text-gray-500">Ngày đặt hàng:</span> {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
            
            {/* Cập nhật trạng thái */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Cập nhật trạng thái</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái hiện tại: {status}</label>
                <select
                  value={status}
                  disabled={updating}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="Pending">Chờ xử lý</option>
                  <option value="Processing">Đang xử lý</option>
                  <option value="Shipped">Đã gửi</option>
                  <option value="Delivered">Đã giao</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="flex justify-between">
                <Link 
                  to="/admin/orders" 
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
                  </svg>
                  Quay lại
                </Link>
                {updating && (
                  <span className="text-sm text-pink-600">Đang cập nhật...</span>
                )}
              </div>
            </div>
          </div>

          {/* Chi tiết đơn hàng */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Chi tiết đơn hàng</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(item.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatPrice(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">Tổng cộng:</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-pink-600">{formatPrice(order.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Chi tiết thanh toán và ghi chú (nếu có) */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Thông tin thanh toán</h4>
                <p><span className="font-medium text-gray-500">Phương thức thanh toán:</span> {order.paymentMethod || 'Chưa có thông tin'}</p>
                <p><span className="font-medium text-gray-500">Trạng thái thanh toán:</span> {order.paymentStatus || 'Chưa có thông tin'}</p>
                
                {order.notes && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Ghi chú đơn hàng</h4>
                    <p className="bg-gray-50 p-3 rounded-md text-sm">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminOrderDetailPage;