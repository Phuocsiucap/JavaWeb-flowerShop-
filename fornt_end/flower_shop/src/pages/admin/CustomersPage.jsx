// src/pages/admin/CustomersPage.jsx
import React from 'react';
import { Search, Filter, ArrowUpDown, Mail, Phone } from 'lucide-react';
import AdminLayout from '../../components/admin/Layout';

const CustomersPage = () => {
  const customers = [
    { 
      id: 1, 
      name: "Nguyễn Văn A", 
      email: "nguyenvana@email.com", 
      phone: "0901234567", 
      totalOrders: 8,
      totalSpent: 2500000,
      lastOrder: "24/04/2025",
      status: "Hoạt động"
    },
    { 
      id: 2, 
      name: "Trần Thị B", 
      email: "tranthib@email.com", 
      phone: "0912345678", 
      totalOrders: 5,
      totalSpent: 1800000,
      lastOrder: "22/04/2025",
      status: "Hoạt động"
    },
    { 
      id: 3, 
      name: "Lê Văn C", 
      email: "levanc@email.com", 
      phone: "0923456789", 
      totalOrders: 3,
      totalSpent: 1200000,
      lastOrder: "20/04/2025",
      status: "Hoạt động"
    },
    { 
      id: 4, 
      name: "Phạm Thị D", 
      email: "phamthid@email.com", 
      phone: "0934567890", 
      totalOrders: 2,
      totalSpent: 950000,
      lastOrder: "15/04/2025",
      status: "Không hoạt động"
    },
    { 
      id: 5, 
      name: "Hoàng Văn E", 
      email: "hoangvane@email.com", 
      phone: "0945678901", 
      totalOrders: 1,
      totalSpent: 350000,
      lastOrder: "10/04/2025",
      status: "Không hoạt động"
    }
  ];
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "Hoạt động": return "bg-green-100 text-green-800";
      case "Không hoạt động": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Khách hàng</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
            Thêm khách hàng
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {/* Search and filters */}
          <div className="p-4 border-b flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm khách hàng..."
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
                <label className="text-sm text-gray-500">Trạng thái:</label>
                <select className="border rounded p-1 text-sm">
                  <option>Tất cả</option>
                  <option>Hoạt động</option>
                  <option>Không hoạt động</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <span>Đơn hàng</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <span>Đã chi tiêu</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <span>Đơn gần nhất</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">ID: #{customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center mb-1">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone size={16} className="mr-2 text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:underline">Xem chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Hiển thị 1-5 trong tổng số 20 khách hàng
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

export default CustomersPage;