import React from "react";

const RevenueReport = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>Không có dữ liệu doanh thu.</div>;
  }

  return (
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr>
          <th className="border px-4 py-2 bg-gray-100">Ngày</th>
          <th className="border px-4 py-2 bg-gray-100">Doanh thu (VNĐ)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => (
          <tr key={idx}>
            <td className="border px-4 py-2">{item.date}</td>
            <td className="border px-4 py-2">{item.revenue.toLocaleString("vi-VN")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RevenueReport;