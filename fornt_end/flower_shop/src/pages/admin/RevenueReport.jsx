import React, { useEffect, useState, useMemo } from 'react';
import AppLayout from '../../components/admin/Layout';
import { useAdmin } from '../../contexts/AdminContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const RevenueReport = () => {
  const { getAllOrders } = useAdmin();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
      }
    };

    fetchOrders();
  }, [getAllOrders]);

  const revenueData = useMemo(() => {
    const map = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const day = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      const amount = Number(order.total.replace(/[₫,]/g, '')) || 0;

      if (map[day]) {
        map[day] += amount;
      } else {
        map[day] = amount;
      }
    });

    return Object.entries(map)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/').map(Number);
        const [dayB, monthB] = b.date.split('/').map(Number);
        return new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB);
      });
  }, [orders]);

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Báo cáo doanh thu</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Doanh thu theo ngày</h2>
          {revenueData.length === 0 ? (
            <p className="text-gray-500">Không có dữ liệu doanh thu.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₫${value.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default RevenueReport;
