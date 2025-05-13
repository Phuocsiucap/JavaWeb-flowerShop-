// src/components/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Users, ShoppingBag, FileText, Settings, Package, TrendingUp } from 'lucide-react';
import AppLayout from '../../components/admin/Layout';
import { useAdmin } from "../../contexts/AdminContext";
import RecentUsersTable from '../../components/admin/dashboard/RecentUsersTable'; 
import SalesChart from '../../components/admin/dashboard/SalesChart';
import TopProductsList from '../../components/admin/dashboard/TopProductsList'; 
import RecentOrdersTable from '../../components/admin/dashboard/RecentOrdersTable';
import StatsGrid from '../../components/admin/dashboard/StatsGrid'; // Import the StatsGrid component
const Dashboard = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newCustomersToday, setNewCustomersToday] = useState(0);
  const [newCustomersYesterday, setNewCustomersYesterday] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const { getAllUsers, adminToken } = useAdmin(); 

  useEffect(() => {
    const fetchUsers = async () => {
      if (adminToken) {
        try {
          const users = await getAllUsers();
          const customers = users.filter(user => user.role === "customer");
          setTotalCustomers(customers.length);  

          const today = new Date();
          const startOfToday = new Date(today.setHours(0, 0, 0, 0));
          const endOfToday = new Date(today.setHours(23, 59, 59, 999));
          const yesterday = new Date(startOfToday);
          yesterday.setDate(yesterday.getDate() - 1);
          const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
          const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

          const newToday = customers.filter(user => {
            const createdAt = new Date(user.createdAt);
            return createdAt >= startOfToday && createdAt <= endOfToday;
          });

          const newYesterday = customers.filter(user => {
            const createdAt = new Date(user.createdAt);
            return createdAt >= startOfYesterday && createdAt <= endOfYesterday;
          });

          setNewCustomersToday(newToday.length);
          setNewCustomersYesterday(newYesterday.length);

          const sortedUsers = [...users].sort((a, b) => {
            if (!a.lastLogin) return 1;
            if (!b.lastLogin) return -1;
            return new Date(b.lastLogin) - new Date(a.lastLogin);
          });

          setRecentUsers(sortedUsers.slice(0, 5));  
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };

    fetchUsers();
  }, [adminToken, getAllUsers]);

  const stats = [
    { title: "Khách hàng mới", value: newCustomersToday, change: newCustomersToday - newCustomersYesterday > 0 ? `Tăng ${newCustomersToday - newCustomersYesterday}` : `Giảm ${newCustomersToday - newCustomersYesterday}`, icon: <Users size={24} /> },
    { title: "Đơn hàng hôm nay", value: "24", change: "+12%", icon: <ShoppingBag size={24} /> },
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
  const topProducts = [
  {
    id: 1,
    name: "Bó hoa hồng đỏ",
    sold: 42,
    price: 350000,
  },
  {
    id: 2,
    name: "Hộp hoa tulip mix",
    sold: 36,
    price: 450000,
  },
  {
    id: 3,
    name: "Giỏ hoa lan hồ điệp",
    sold: 28,
    price: 750000,
  },
];


  // Formatage de la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <AppLayout>
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>
      
      {/* Stats Grid */}
        <StatsGrid stats={stats} totalCustomers={totalCustomers} />

       {/* Recent Orders */}
        <RecentOrdersTable orders={recentOrders} />


       {/* Recent Users */}
        <RecentUsersTable users={recentUsers} />

      {/* Sales Chart and Inventory Summary would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesChart orders={recentOrders} />

          <TopProductsList products={topProducts} />
        </div>
    </div>
    </AppLayout>
  );
};

export default Dashboard;

