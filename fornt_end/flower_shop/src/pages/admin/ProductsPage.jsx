// src/pages/admin/ProductsPage.jsx
import React, { useState } from 'react';
import { Search, Plus, Edit, Trash, Filter, ArrowUpDown } from 'lucide-react';
import AdminLayout from '../../components/admin/Layout';

const ProductsPage = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  const products = [ 
    { 
      id: 1, 
      name: "Bó hoa hồng đỏ", 
      category: "Hoa hồng", 
      price: 350000, 
      stock: 25, 
      image: "/images/products/red-roses.jpg",
      status: "Còn hàng"
    },
    { 
      id: 2, 
      name: "Hộp hoa tulip mix", 
      category: "Hoa tulip", 
      price: 450000, 
      stock: 18, 
      image: "/images/products/tulip-box.jpg",
      status: "Còn hàng"
    },
    { 
      id: 3, 
      name: "Giỏ hoa lan hồ điệp", 
      category: "Hoa lan", 
      price: 750000, 
      stock: 10, 
      image: "/images/products/orchid-basket.jpg",
      status: "Còn hàng"
    },
    { 
      id: 4, 
      name: "Bó hoa cưới cẩm tú cầu", 
      category: "Hoa cưới", 
      price: 550000, 
      stock: 0, 
      image: "/images/products/wedding-bouquet.jpg",
      status: "Hết hàng"
    },
    { 
      id: 5, 
      name: "Lẵng hoa khai trương", 
      category: "Hoa chúc mừng", 
      price: 850000, 
      stock: 5, 
      image: "/images/products/opening-basket.jpg",
      status: "Còn hàng"
    },
  ];
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };
  
  const toggleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center">
            <Plus size={18} className="mr-1" />
            Thêm sản phẩm
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          {/* Search and filters */}
          <div className="p-4 border-b flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  className="pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button className="border rounded-lg px-3 py-2 flex items-center">
                <Filter size={18} className="mr-1" />
                <span>Lọc</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedProducts.length > 0 && (
                <>
                  <span className="text-sm text-gray-500">Đã chọn {selectedProducts.length} sản phẩm</span>
                  <button className="text-red-600 bg-red-50 px-3 py-1 rounded-md text-sm">Xóa đã chọn</button>
                </>
              )}
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500"
                      onChange={toggleSelectAll}
                      checked={selectedProducts.length === products.length}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <span>Danh mục</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <span>Giá</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <span>Tồn kho</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-md bg-gray-200 flex-shrink-0">
                          {/* Image placeholder */}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: #{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === "Còn hàng" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={18} />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Hiển thị 1-5 trong tổng số 25 sản phẩm
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

export default ProductsPage;