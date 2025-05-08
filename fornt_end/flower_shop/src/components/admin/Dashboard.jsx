// src/components/admin/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Users, ShoppingBag, FileText, Settings, Package, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: "Đơn hàng hôm nay", value: "24", change: "+12%", icon: <ShoppingBag size={24} /> },
    { title: "Khách hàng mới", value: "15", change: "+5%", icon: <Users size={24} /> },
    { title: "Doanh thu", value: "₫2.5M", change: "+18%", icon: <TrendingUp size={24} /> },
    { title: "Sản phẩm đã bán", value: "42", change: "+7%", icon: <Package size={24} /> },
  ];

  const recentOrders = [
    { id: "ORD-7291", customer: "Nguyễn Văn A", date: "24/04/2025", status: "Đã giao", amount: "₫450,000" },
    { id: "ORD-7290", customer: "Trần Thị B", date: "24/04/2025", status: "Đang giao", amount: "₫750,000" },
    { id: "ORD-7289", customer: "Lê Văn C", date: "23/04/2025", status: "Đang xử lý", amount: "₫350,000" },
    { id: "ORD-7288", customer: "Phạm Thị D", date: "23/04/2025", status: "Đã giao", amount: "₫680,000" },
    { id: "ORD-7287", customer: "Hoàng Văn E", date: "22/04/2025", status: "Đã hủy", amount: "₫230,000" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã giao": return "bg-green-100 text-green-800";
      case "Đang giao": return "bg-blue-100 text-blue-800";
      case "Đang xử lý": return "bg-yellow-100 text-yellow-800";
      case "Đã hủy": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-green-500 text-sm">{stat.change} so với hôm qua</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="text-blue-600 hover:underline text-sm">Xem tất cả</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Chart and Inventory Summary would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Thống kê doanh số</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50">
            <p className="text-gray-400">Biểu đồ doanh số sẽ hiển thị ở đây</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Sản phẩm bán chạy</h2>
          <ul className="space-y-4">
            <li className="flex items-center justify-between">
              <div className="flex">
                <div className="w-10 h-10 bg-pink-100 rounded-md flex items-center justify-center mr-3">
                  <span className="text-pink-500">1</span>
                </div>
                <div>
                  <p className="font-medium">Bó hoa hồng đỏ</p>
                  <p className="text-sm text-gray-500">Đã bán: 42 bó</p>
                </div>
              </div>
              <p className="font-medium">₫350,000</p>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex">
                <div className="w-10 h-10 bg-pink-100 rounded-md flex items-center justify-center mr-3">
                  <span className="text-pink-500">2</span>
                </div>
                <div>
                  <p className="font-medium">Hộp hoa tulip mix</p>
                  <p className="text-sm text-gray-500">Đã bán: 36 hộp</p>
                </div>
              </div>
              <p className="font-medium">₫450,000</p>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex">
                <div className="w-10 h-10 bg-pink-100 rounded-md flex items-center justify-center mr-3">
                  <span className="text-pink-500">3</span>
                </div>
                <div>
                  <p className="font-medium">Giỏ hoa lan hồ điệp</p>
                  <p className="text-sm text-gray-500">Đã bán: 28 giỏ</p>
                </div>
              </div>
              <p className="font-medium">₫750,000</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;