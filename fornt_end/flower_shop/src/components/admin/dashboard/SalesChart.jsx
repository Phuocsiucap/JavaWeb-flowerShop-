import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const SalesChart = ({ orders }) => {
  // Tính tổng doanh thu theo ngày
  const salesData = useMemo(() => {
  const map = {};

  orders.forEach(order => {
    const date = order.date; // e.g., "24/04/2025"
    const amount = Number(order.amount.replace(/[₫,]/g, '')); // Chuyển "₫450,000" → 450000

    if (map[date]) {
      map[date] += amount;
    } else {
      map[date] = amount;
    }
  });

  // Chuyển object thành mảng và sắp xếp tăng dần theo ngày
  return Object.entries(map)
    .map(([date, sales]) => ({ date, sales }))
    .sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });
}, [orders]);


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Thống kê doanh số (₫)</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => value / 1000000 + 'M'} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
