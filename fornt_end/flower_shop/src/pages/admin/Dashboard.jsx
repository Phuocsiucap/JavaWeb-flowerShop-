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
import Cookies from 'js-cookie';

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
        let usersArr = [];
        const cachedUsers = Cookies.get('dashboard_users');
        if (cachedUsers) {
          usersArr = JSON.parse(cachedUsers);
        } else {
          const usersResponse = await getAllUsers();
          usersArr = Array.isArray(usersResponse) ? usersResponse : [];
          Cookies.set('dashboard_users', JSON.stringify(usersArr));
        }
        const customers = usersArr.filter((user) => user.role === 'customer');
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
        }).length;
        const newYesterday = customers.filter((user) => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= startOfYesterday && createdAt <= endOfYesterday;
        }).length;
        setNewCustomersToday(newToday);
        setNewCustomersYesterday(newYesterday);

        const sortedUsers = [...usersArr]
          .sort((a, b) => {
            if (!a.lastLogin) return 1;
            if (!b.lastLogin) return -1;
            return new Date(b.lastLogin) - new Date(a.lastLogin);
          })
          .slice(0, 5)
          .map(user => ({
            ...user,
            name: user.name || 'Không có tên',
          }));
        setRecentUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users data:', error.response || error.message);
        setError('Không thể tải dữ liệu người dùng.');
      }
    };

    const fetchOrdersData = async () => {
      try {
        let ordersArr = [];
        const cachedOrders = Cookies.get('dashboard_orders');
        if (cachedOrders) {
          ordersArr = JSON.parse(cachedOrders);
        } else {
          const ordersResponse = await getAllOrders();
          ordersArr = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
          Cookies.set('dashboard_orders', JSON.stringify(ordersArr));
        }
        let orders = ordersArr.map(order => ({
          ...order,
          orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
          totalAmount: order.totalAmount || 0,
          userId: order.userId || null,
          items: Array.isArray(order.items) ? order.items : [],
        }));

        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

        const mappedOrders = await Promise.all(
          orders.map(async (order) => {
            let customer = null;
            if (order.userId) {
              try {
                const userResponse = await getUserById(order.userId);
                customer = userResponse || null;
                if (customer) {
                  customer.name = customer.name || 'Không có tên';
                }
              } catch (error) {
                console.warn(`Error fetching user ${order.userId}:`, error);
              }
            }
            return {
              ...order,
              createdAt: new Date(order.orderDate),
              totalPrice: order.totalAmount,
              customer,
            };
          })
        );

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

        setRevenueToday(ordersTodayList.reduce((sum, order) => sum + (order.totalPrice || 0), 0));
        setRevenueYesterday(ordersYesterdayList.reduce((sum, order) => sum + (order.totalPrice || 0), 0));

        setProductsSoldToday(
          ordersTodayList.reduce(
            (sum, order) => sum + (order.items.reduce((total, item) => total + (item.quantity || 0), 0) || 0),
            0
          )
        );
        setProductsSoldYesterday(
          ordersYesterdayList.reduce(
            (sum, order) => sum + (order.items.reduce((total, item) => total + (item.quantity || 0), 0) || 0),
            0
          )
        );

        const recentOrdersList = mappedOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setRecentOrders(recentOrdersList);

        // Tính toán top 3 sản phẩm bán chạy nhất từ tất cả order items
        const productSales = {};
        const productDetails = {};
        mappedOrders.forEach((order) => {
          (order.items || []).forEach((item) => {
            if (item.productId) {
              productSales[item.productId] = (productSales[item.productId] || 0) + (item.quantity || 0);
              // Lưu thông tin sản phẩm (ưu tiên lần đầu gặp)
              if (!productDetails[item.productId]) {
                productDetails[item.productId] = {
                  name: item.productName || `Sản phẩm ${item.productId}`,
                  imageUrl: item.imageUrl || null,
                  price: item.price || 0,
                };
              }
            }
          });
        });
        // Lấy 3 sản phẩm bán chạy nhất
        const topProductIds = Object.entries(productSales)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => id);
        const topProductsList = topProductIds.map((id) => ({
          id,
          name: productDetails[id].name,
          sold: productSales[id],
          imageUrl: productDetails[id].imageUrl,
          price: productDetails[id].price,
        }));
        setTopProducts(topProductsList);
      } catch (error) {
        console.error('Error fetching orders data:', error.response || error.message);
        setError('Không thể tải dữ liệu đơn hàng.');
      }
    };

    const fetchData = async () => {
      if (!adminToken) {
        setError('Chưa đăng nhập');
        return;
      }
      console.log('Admin token:', adminToken);
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchUsersData(), fetchOrdersData()]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Không thể tải dữ liệu dashboard.');
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

  if (isLoading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>
        <StatsGrid stats={stats} totalCustomers={totalCustomers} />
        <RecentOrdersTable orders={recentOrders} />
        <RecentUsersTable users={recentUsers} />
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Thống kê doanh số (₫)</h2>
            <Link
              to="/admin/reports"
              className="text-blue-600 hover:underline text-sm"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="h-64">
            <SalesChart orders={recentOrders} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;