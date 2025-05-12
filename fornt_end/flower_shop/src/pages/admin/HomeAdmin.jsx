import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext'; // Sử dụng useAdmin thay vì AdminContext
import AppLayout from '../../components/admin/Layout';
import { Flower2, Users, ShoppingCart, DollarSign, Package, Calendar, Settings, PieChart, Home } from 'lucide-react';

const HomeAdmin = () => {
  const { verifyTokenAdmin } = useAdmin(); // Sử dụng useAdmin để lấy verifyTokenAdmin
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkToken = async () => {
      try {
        const valid = await verifyTokenAdmin();


        if (valid) {
          alert("Token hợp lệ");
        } else {
          alert("Token không hợp lệ");
        }
        setIsTokenValid(valid);
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsTokenValid(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkToken();
  }, [verifyTokenAdmin]);

  // Các phần quản lý của trang admin
  const adminModules = [
    { 
      title: "Trang chủ", 
      description: "Tổng quan về hoạt động kinh doanh",
      icon: <Home className="h-8 w-8 text-pink-500" />,
      link: "/admin/dashboard"
    },
    { 
      title: "Quản lý sản phẩm", 
      description: "Thêm, sửa, xóa các sản phẩm hoa",
      icon: <Flower2 className="h-8 w-8 text-green-500" />,
      link: "/admin/products"
    },
    { 
      title: "Quản lý đơn hàng", 
      description: "Xem và xử lý các đơn đặt hàng",
      icon: <ShoppingCart className="h-8 w-8 text-blue-500" />,
      link: "/admin/orders"
    },
    { 
      title: "Quản lý khách hàng", 
      description: "Thông tin của khách hàng",
      icon: <Users className="h-8 w-8 text-purple-500" />,
      link: "/admin/customers"
    },
    { 
      title: "Báo cáo doanh thu", 
      description: "Thống kê doanh thu bán hàng",
      icon: <DollarSign className="h-8 w-8 text-yellow-500" />,
      link: "/admin/revenue"
    },
    { 
      title: "Quản lý kho", 
      description: "Kiểm soát tồn kho và nguyên liệu",
      icon: <Package className="h-8 w-8 text-orange-500" />,
      link: "/admin/inventory"
    },
    { 
      title: "Lịch giao hàng", 
      description: "Quản lý lịch trình giao hoa",
      icon: <Calendar className="h-8 w-8 text-red-500" />,
      link: "/admin/delivery"
    },
    { 
      title: "Báo cáo thống kê", 
      description: "Phân tích số liệu kinh doanh",
      icon: <PieChart className="h-8 w-8 text-indigo-500" />,
      link: "/admin/statistics"
    },
    { 
      title: "Cài đặt hệ thống", 
      description: "Cấu hình và thiết lập hệ thống",
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      link: "/admin/settings"
    }
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Xin chào, Admin!</h1>
          <p className="text-gray-600 mt-2">Chào mừng quay trở lại với hệ thống quản lý cửa hàng hoa</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <a 
              href={module.link} 
              key={index}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-4">
                {module.icon}
                <h2 className="ml-4 text-xl font-semibold text-gray-800">{module.title}</h2>
              </div>
              <p className="text-gray-600">{module.description}</p>
              <div className="mt-4 text-right">
                <span className="text-pink-500 font-medium">Xem chi tiết →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default HomeAdmin;