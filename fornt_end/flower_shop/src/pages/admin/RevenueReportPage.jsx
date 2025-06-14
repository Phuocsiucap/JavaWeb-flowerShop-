import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/admin/Layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Loader2, AlertCircle, Trophy, Users, Star } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { useAdmin } from '../../contexts/AdminContext';
import Cookies from 'js-cookie';
import AlertNotification from '../../components/ui/AlertNotification';

const RevenueReportPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [bestSeller, setBestSeller] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const { adminToken, verifyTokenAdmin, getRevenueData } = useAdmin();

  // Tạo mảng ngày 7 ngày gần nhất tính đến hôm nay
  const generateDateRange = () => {
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      const key = date.toISOString().split('T')[0]; // yyyy-MM-dd
      result.push({ label, key });
    }
    return result;
  };

  const fetchRevenueData = async () => {
    setIsLoading(true);
    setNotification({ show: false, type: '', message: '' });
    try {
      const response = await getRevenueData();
      if (!response.success) {
        // throw new Error(response.message || 'Không thể tải dữ liệu doanh thu.');
      }
      const rawData = response.data;
      // Xử lý revenue
      const map = {};
      (rawData.revenue || []).forEach((item) => {
        map[item.date] = Math.round(item.revenue);
      });
      const dateRange = generateDateRange();
      const formatted = dateRange.map(({ label, key }) => ({
        date: label,
        revenue: map[key] || 0,
      }));
      setRevenueData(formatted);
      setTopCustomers(rawData.topCustomers || []);
      setBestSeller(rawData.bestSeller || null);
      // // setNotification({
      // //   show: true,
      // //   type: 'success',
      // //   message: response.message || 'Tải dữ liệu doanh thu thành công!',
      // // });
      // await Swal.fire({
      //   title: 'Thành công!',
      //   text: response.message || 'Tải dữ liệu doanh thu thành công!',
      //   icon: 'success',
      //   confirmButtonText: 'OK',
      // });
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu doanh thu:', err);
      // setNotification({
      //   show: true,
      //   type: 'error',
      //   message: err.message || 'Không thể tải dữ liệu doanh thu.',
      // });
      // await Swal.fire({
      //   title: 'Lỗi!',
      //   text: err.message || 'Không thể tải dữ liệu doanh thu.',
      //   icon: 'error',
      //   confirmButtonText: 'OK',
      // });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      if (!adminToken) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
        });
        await Swal.fire({
          title: 'Lỗi!',
          text: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        setIsLoading(false);
        return;
      }
      try {
        const valid = await verifyTokenAdmin(adminToken);
        if (!valid) {
          Cookies.remove('adminToken');
          setNotification({
            show: true,
            type: 'error',
            message: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
          });
          await Swal.fire({
            title: 'Lỗi!',
            text: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          setIsLoading(false);
          return;
        }
        await fetchRevenueData();
      } catch (err) {
        console.error('Lỗi khi xác thực token:', err);
        setNotification({
          show: true,
          type: 'error',
          message: 'Lỗi xác thực. Vui lòng thử lại.',
        });
        await Swal.fire({
          title: 'Lỗi!',
          text: 'Lỗi xác thực. Vui lòng thử lại.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        setIsLoading(false);
      }
    };
    checkTokenAndFetchData();
  }, [adminToken, verifyTokenAdmin]);

  // Hàm xuất PDF
  const handleExportPDF = async () => {
    const input = document.getElementById('revenue-report-pdf');
    if (!input) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Không tìm thấy nội dung để xuất PDF.',
      });
      await Swal.fire({
        title: 'Lỗi!',
        text: 'Không tìm thấy nội dung để xuất PDF.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 20, 20, pdfWidth, pdfHeight);
      pdf.save('bao-cao-doanh-thu.pdf');
      setNotification({
        show: true,
        type: 'success',
        message: 'Xuất báo cáo PDF thành công!',
      });
      await Swal.fire({
        title: 'Thành công!',
        text: 'Xuất báo cáo PDF thành công!',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (err) {
      console.error('Lỗi khi xuất PDF:', err);
      setNotification({
        show: true,
        type: 'error',
        message: 'Không thể xuất báo cáo PDF.',
      });
      await Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể xuất báo cáo PDF.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // Component cho bảng top customers
  const TopCustomersTable = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Top 3 khách hàng nổi bật trong tuần</h2>
        </div>
      </div>
      <div className="p-6">
        {topCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không có dữ liệu khách hàng</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hạng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên khách hàng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Trophy className="w-5 h-5 text-orange-500" />}
                        <span className="font-semibold text-lg">{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-600">{customer.email}</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-semibold text-green-600">
                        {customer.totalAmount.toLocaleString('vi-VN')}₫
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Component cho bảng best seller
  const BestSellerTable = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Mặt hàng bán chạy nhất trong tuần</h2>
        </div>
      </div>
      <div className="p-6">
        {!bestSeller ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không có dữ liệu sản phẩm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Thứ hạng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên sản phẩm</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Số lượng bán</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-lg text-yellow-600">#1</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{bestSeller.productName}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-emerald-600 text-lg">
                      {bestSeller.totalQuantity} <span className="text-sm text-gray-500">sản phẩm</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {notification.show && (
          <AlertNotification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification({ ...notification, show: false })}
          />
        )}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Báo cáo doanh thu</h1>
          <button
            onClick={handleExportPDF}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md font-medium"
          >
            Xuất file PDF
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Grid layout cho 2 bảng */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopCustomersTable />
              <BestSellerTable />
            </div>

            {/* Biểu đồ doanh thu */}
            <div
              id="revenue-report-pdf"
              className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-xl mt-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-gray-800">Biểu đồ doanh thu 7 ngày gần nhất</h2>
              </div>
              <div className="text-gray-500 mb-6 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {revenueData.length > 0 ? `Từ ${revenueData[0].date} đến ${revenueData[revenueData.length - 1].date}` : ''}
                </span>
              </div>
              {revenueData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Không có dữ liệu doanh thu.</p>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={revenueData}
                    margin={{ top: 30, right: 40, left: 0, bottom: 10 }}
                    barCategoryGap={30}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 15, fill: '#374151' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 15, fill: '#374151' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        background: '#fff',
                        boxShadow: '0 2px 12px #0001',
                        border: 'none',
                        fontSize: 16,
                      }}
                      formatter={(value) => [`₫${value.toLocaleString('vi-VN')}`, 'Doanh thu']}
                      labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                      cursor={{ fill: '#10b98111' }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#revenueGradient)"
                      radius={[12, 12, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1200}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default RevenueReportPage;