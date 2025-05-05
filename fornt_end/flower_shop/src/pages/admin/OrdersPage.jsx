// src/pages/admin/OrdersPage.jsx
import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Eye, Download } from 'lucide-react';
import AdminLayout from '../../components/admin/Layout';

const OrdersPage = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  
  const orders = [
    { 
      id: "ORD-7291", 
      customer: "Nguyễn Văn A", 
      date: "24/04/2025", 
      status: "Đã giao", 
      payment: "Đã thanh toán",
      amount: 450000,
      items: 3
    },
    { 
      id: "ORD-7290", 
      customer: "Trần Thị B", 
      date: "24/04/2025",
      // Tiếp tục file OrdersPage.jsx
      status: "Đang giao", 
      payment: "Đã thanh toán",
      amount: 750000,
      items: 5
    },
    { 
      id: "ORD-7289", 
      customer: "Lê Văn C", 
      date: "23/04/2025", 
      status: "Đang xử lý", 
      payment: "Chờ thanh toán",
      amount: 350000,
      items: 2
    },
    { 
      id: "ORD-7288", 
      customer: "Phạm Thị D", 
      date: "23/04/2025", 
      status: "Đã giao", 
      payment: "Đã thanh toán",
      amount: 680000,
      items: 4
    },
    { 
      id: "ORD-7287", 
      customer: "Hoàng Văn E", 
      date: "22/04/2025", 
      status: "Đã hủy", 
      payment: "Hoàn tiền",
      amount: 230000,
      items: 1
    },
  ];
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "Đã giao": return "bg-green-100 text-green-800";
      case "Đang giao": return "bg-blue-100 text-blue-800";
      case "Đang xử lý": return "bg-yellow-100 text-yellow-800";
      case "Đã hủy": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getPaymentColor = (payment) => {
    switch (payment) {
      case "Đã thanh toán": return "bg-green-100 text-green-800";
      case "Chờ thanh toán": return "bg-yellow-100 text-yellow-800";
      case "Hoàn tiền": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => {
        if (selectedTab === 'processing') return order.status === "Đang xử lý";
        if (selectedTab === 'shipping') return order.status === "Đang giao";
        if (selectedTab === 'completed') return order.status === "Đã giao";
        if (selectedTab === 'cancelled') return order.status === "Đã hủy";
        return true;
      });
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center">
            <Download size={18} className="mr-1" />
            Xuất báo cáo
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b px-4">
            <nav className="flex space-x-6">
              <button 
                className={`py-4 px-1 relative ${selectedTab === 'all' 
                  ? 'text-blue-600 font-medium border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSelectedTab('all')}
              >
                Tất cả
                <span className="absolute top-3 right-0 bg-gray-100 text-xs px-1.5 rounded-full">
                  {orders.length}
                </span>
              </button>
              <button 
                className={`py-4 px-1 relative ${selectedTab === 'processing' 
                  ? 'text-blue-600 font-medium border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSelectedTab('processing')}
              >
                Đang xử lý
                <span className="absolute top-3 right-0 bg-yellow-100 text-yellow-800 text-xs px-1.5 rounded-full">
                  {orders.filter(o => o.status === "Đang xử lý").length}
                </span>
              </button>
              <button 
                className={`py-4 px-1 relative ${selectedTab === 'shipping' 
                  ? 'text-blue-600 font-medium border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSelectedTab('shipping')}
              >
                Đang giao
                <span className="absolute top-3 right-0 bg-blue-100 text-blue-800 text-xs px-1.5 rounded-full">
                  {orders.filter(o => o.status === "Đang giao").length}
                </span>
              </button>
              <button 
                className={`py-4 px-1 relative ${selectedTab === 'completed' 
                  ? 'text-blue-600 font-medium border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSelectedTab('completed')}
              >
                Đã giao
                <span className="absolute top-3 right-0 bg-green-100 text-green-800 text-xs px-1.5 rounded-full">
                  {orders.filter(o => o.status === "Đã giao").length}
                </span>
              </button>
              <button 
                className={`py-4 px-1 relative ${selectedTab === 'cancelled' 
                  ? 'text-blue-600 font-medium border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setSelectedTab('cancelled')}
              >
                Đã hủy
                <span className="absolute top-3 right-0 bg-red-100 text-red-800 text-xs px-1.5 rounded-full">
                  {orders.filter(o => o.status === "Đã hủy").length}
                </span>
              </button>
            </nav>
          </div>
          
          {/* Search and filters */}
          <div className="p-4 border-b flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm đơn hàng..."
                  className="pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button className="border rounded-lg px-3 py-2 flex items-center">
                <Filter size={18} className="mr-1" />
                <span>Lọc</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <label className="text-sm text-gray-500">Sắp xếp theo:</label>
                <select className="border rounded p-1 text-sm">
                  <option>Mới nhất</option>
                  <option>Cũ nhất</option>
                  <option>Giá cao - thấp</option>
                  <option>Giá thấp - cao</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <span>Mã đơn</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <span>Ngày đặt</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <span>Tổng tiền</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(order.payment)}`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(order.amount)}
                      <div className="text-xs text-gray-400">{order.items} sản phẩm</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
          
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Hiển thị 1-5 trong tổng số 25 đơn hàng
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border rounded hover:bg-gray-50">Trước</button>
              <button className="px-3 py-1 border rounded bg-blue-50 text-blue-600">1</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">Sau</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;