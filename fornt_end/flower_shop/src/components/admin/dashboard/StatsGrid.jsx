// src/components/admin/Dashboard/StatsGrid.jsx
import React from 'react';
import { Users, ShoppingBag, TrendingUp, Package } from 'lucide-react';

const StatsGrid = ({ stats , totalCustomers}) => {
  // Mapping des icônes par titre (pour éviter de les passer en props)
  const getIconForStat = (title) => {
    switch (title) {
      case "Khách hàng mới": return <Users size={24} />;
      case "Đơn hàng hôm nay": return <ShoppingBag size={24} />;
      case "Doanh thu": return <TrendingUp size={24} />;
      case "Sản phẩm đã bán": return <Package size={24} />;
      default: return <TrendingUp size={24} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.title === "Khách hàng mới" && (
                    <p className="text-gray-500 text-sm mt-1">Tổng số khách hàng: {totalCustomers}</p>
                  )}
                  <p className="text-green-500 text-sm">{stat.change} so với hôm qua</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
  );
};

export default StatsGrid;