import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function SupplierRevenueDashboard() {
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    totalProductsSold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('2025-05-01');
  const [toDate, setToDate] = useState('2025-06-30');

  useEffect(() => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      setSupplierId(parsed._id);
    }
  }, []);

  useEffect(() => {
    if (!supplierId) return;

    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/orders/supplier/${supplierId}/revenue?from=${fromDate}&to=${toDate}`
        );
        setRevenueData(res.data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu doanh thu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [supplierId, fromDate, toDate]);

  if (loading || !supplierId)
    return <p className="text-center text-gray-500 mt-8">Đang tải dữ liệu...</p>;

  const chartData = [
    { name: 'Tổng doanh thu', value: revenueData.totalRevenue },
    { name: 'Sản phẩm đã bán', value: revenueData.totalProductsSold },
    { name: 'Đơn hàng hoàn thành', value: revenueData.totalOrdersCount },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <h2 className="text-4xl font-black text-center text-indigo-700 uppercase tracking-wide">
        📊 Thống kê doanh thu
      </h2>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-3 py-2 shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-3 py-2 shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center hover:shadow-md transition-all">
          <p className="text-sm text-gray-500">Tổng doanh thu</p>
          <h3 className="text-3xl font-extrabold text-green-600 mt-2">
            {revenueData.totalRevenue.toLocaleString()} đ
          </h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center hover:shadow-md transition-all">
          <p className="text-sm text-gray-500">Sản phẩm đã bán</p>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-2">
            {revenueData.totalProductsSold}
          </h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center hover:shadow-md transition-all">
          <p className="text-sm text-gray-500">Đơn hàng hoàn thành</p>
          <h3 className="text-3xl font-extrabold text-yellow-600 mt-2">
            {revenueData.totalOrdersCount}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow p-6">
        <h3 className="text-2xl font-semibold text-gray-700 mb-6">Biểu đồ doanh thu tổng quan</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 13, fill: '#6b7280' }} />
            <Tooltip itemStyle={{ fontSize: 14 }} />
            <Legend wrapperStyle={{ fontSize: 14 }} />
            <Bar dataKey="value" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
