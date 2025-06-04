import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Users, ShoppingBag, FileText, Settings, Package, TrendingUp } from 'lucide-react';
import AppLayout from '../../components/admin/Layout';
import { useAdmin } from '../../contexts/AdminContext';
import RecentUsersTable from '../../components/admin/dashboard/RecentUsersTable';
import SalesChart from '../../components/admin/dashboard/SalesChart';
import TopProductsList from '../../components/admin/dashboard/TopProductsList';
import RecentOrdersTable from '../../components/admin/dashboard/RecentOrdersTable';
import StatsGrid from '../../components/admin/dashboard/StatsGrid';
import axios from '../../axiosInstance';

const Dashboard = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newCustomersToday, setNewCustomersToday] = useState(0);
  const [newCustomersYesterday, setNewCustomersYesterday] = useState(0);
  const [ordersToday, setOrdersToday] = useState(0);
  const [ordersYesterday, setOrdersYesterday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueYesterday, setRevenueYesterday] = useState(0);
  const [productsSoldToday, setProductsSoldToday] = useState(0);
  const [productsSoldYesterday, setProductsSoldYesterday] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAllUsers, getAllOrders, getUserById, adminToken } = useAdmin();

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const users = await getAllUsers();
        const customers = users.filter((user) => user.role === 'customer');
        setTotalCustomers(customers.length);

        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

        const newToday = customers.filter((user) => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= startOfToday && createdAt <= endOfToday;
        });
        const newYesterday = customers.filter((user) => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= startOfYesterday && createdAt <= endOfYesterday;
        });
        setNewCustomersToday(newToday.length);
        setNewCustomersYesterday(newYesterday.length);

        const sortedUsers = [...users]
          .sort((a, b) => {
            if (!a.lastLogin) return 1;
            if (!b.lastLogin) return -1;
            return new Date(b.lastLogin) - new Date(a.lastLogin);
          })
          .slice(0, 5);
        setRecentUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users data:', error);
        setError('Failed to load user data.');
      }
    };

    const fetchOrdersData = async () => {
      try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

        // Fetch all orders (đã có đủ items từ API mới)
        const orders = await getAllOrders();
        // Map lại cho đúng format
        const mappedOrders = await Promise.all(
          orders.map(async (order) => {
            const customer = order.userId ? await getUserById(order.userId) : null;
            return {
              ...order,
              createdAt: new Date(order.orderDate),
              totalPrice: order.totalAmount,
              customer,
            };
          })
        );

        // Orders today and yesterday
        const ordersTodayList = mappedOrders.filter((order) => {
          const createdAt = new Date(order.createdAt);
          return createdAt >= startOfToday && createdAt <= endOfToday;
        });
        const ordersYesterdayList = mappedOrders.filter((order) => {
          const createdAt = new Date(order.createdAt);
          return createdAt >= startOfYesterday && createdAt <= endOfYesterday;
        });
        setOrdersToday(ordersTodayList.length);
        setOrdersYesterday(ordersYesterdayList.length);

        // Revenue today and yesterday
        setRevenueToday(ordersTodayList.reduce((sum, order) => sum + (order.totalPrice || 0), 0));
        setRevenueYesterday(ordersYesterdayList.reduce((sum, order) => sum + (order.totalPrice || 0), 0));

        // Products sold today and yesterday
        setProductsSoldToday(
          ordersTodayList.reduce(
            (sum, order) =>
              sum + (order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0),
            0
          )
        );
        setProductsSoldYesterday(
          ordersYesterdayList.reduce(
            (sum, order) =>
              sum + (order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0),
            0
          )
        );

        // Recent orders
        const recentOrdersList = mappedOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3); 
        setRecentOrders(recentOrdersList);

        // Top products
        const productSales = {};
        const productNames = {};
        mappedOrders.forEach((order) => {
          if (order.items) {
            order.items.forEach((item) => {
              productSales[item.productId] = (productSales[item.productId] || 0) + (item.quantity || 0);
              productNames[item.productId] = item.productName || `Sản phẩm ${item.productId}`;
            });
          }
        });
        const topProductIds = Object.entries(productSales)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id]) => id);
        const topProductsList = topProductIds.map((id) => ({
          id,
          name: productNames[id],
          sold: productSales[id],
          imageUrl: mappedOrders
            .flatMap((order) => order.items || [])
            .find((item) => item.productId === id)?.imageUrl,
        }));
        setTopProducts(topProductsList);
      } catch (error) {
        console.error('Error fetching orders data:', error);
        setError('Failed to load order data.');
      }
    };

    const fetchData = async () => {
      if (!adminToken) return;
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchUsersData(), fetchOrdersData()]);
      } catch (error) {
        setError('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [adminToken, getAllUsers, getAllOrders, getUserById]);

  const stats = [
    {
      title: 'Khách hàng mới',
      value: newCustomersToday,
      change: newCustomersYesterday > 0
        ? `${((newCustomersToday - newCustomersYesterday) / newCustomersYesterday * 100).toFixed(1)}%`
        : '0%',
      icon: <Users size={24} />,
    },
    {
      title: 'Đơn hàng hôm nay',
      value: ordersToday,
      change: ordersYesterday > 0
        ? `${((ordersToday - ordersYesterday) / ordersYesterday * 100).toFixed(1)}%`
        : '0%',
      icon: <ShoppingBag size={24} />,
    },
    {
      title: 'Doanh thu',
      value: `₫${revenueToday.toLocaleString()}`,
      change: revenueYesterday > 0
        ? `${((revenueToday - revenueYesterday) / revenueYesterday * 100).toFixed(1)}%`
        : '0%',
      icon: <TrendingUp size={24} />,
    },
    {
      title: 'Sản phẩm đã bán',
      value: productsSoldToday,
      change: productsSoldYesterday > 0
        ? `${((productsSoldToday - productsSoldYesterday) / productsSoldYesterday * 100).toFixed(1)}%`
        : '0%',
      icon: <Package size={24} />,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã giao':
        return 'bg-green-100 text-green-800';
      case 'Đang giao':
        return 'bg-blue-100 text-blue-800';
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

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

        {/* Sales Chart and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesChart orders={recentOrders} />
          <TopProductsList products={topProducts} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;