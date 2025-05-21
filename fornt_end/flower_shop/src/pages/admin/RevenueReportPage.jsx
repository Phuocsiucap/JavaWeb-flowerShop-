import React, { useEffect, useState } from "react";
import AppLayout from "../../components/admin/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { getRevenueData } from "../../services/RevenueService";
import { Loader2, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const RevenueReportPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Tạo mảng ngày từ -7 đến +3
  const generateDateRange = () => {
    const result = [];
    const today = new Date();
    for (let i = -7; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const label = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const key = date.toISOString().split("T")[0]; // yyyy-MM-dd
      result.push({ label, key });
    }
    return result;
  };

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const rawData = await getRevenueData(); // [{ date: "2025-05-15", revenue: 600000 }]
        const map = {};
        rawData.forEach(item => {
          map[item.date] = Math.round(item.revenue); // Dạng "2025-05-15"
        });

        const dateRange = generateDateRange();

        const formatted = dateRange.map(({ label, key }) => ({
          date: label,
          revenue: map[key] || 0
        }));

        setRevenueData(formatted);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu doanh thu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  // Hàm xuất PDF
  const handleExportPDF = () => {
    const input = document.getElementById("revenue-report-pdf");
    if (!input) return;
    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 20, 20, pdfWidth, pdfHeight);
      pdf.save("bao-cao-doanh-thu.pdf");
    });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Báo cáo doanh thu</h1>
        <button
          onClick={handleExportPDF}
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          In ra PDF
        </button>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            {error}
          </div>
        ) : (
          <div id="revenue-report-pdf" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Doanh thu từ 7 ngày trước đến 3 ngày sau</h2>
            {revenueData.length === 0 ? (
              <p className="text-gray-500">Không có dữ liệu doanh thu.</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => `₫${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RevenueReportPage;
