import { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import classNames from 'classnames';

export default function SupplierRevenueDashboard() {
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, totalOrdersCount: 0, totalProductsSold: 0 });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('2025-05-01');
  const [toDate, setToDate] = useState('2025-06-30');
  const [dailyRevenue, setDailyRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sold: number }[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<{ status: string; count: number }[]>([]);

  useEffect(() => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      setSupplierId(parsed._id);
    }
  }, []);

  useEffect(() => {
    if (supplierId) fetchDashboardData();
  }, [supplierId, fromDate, toDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [rev, dailyRev, topProd, status] = await Promise.all([
        axios.get(`http://localhost:5000/orders/supplier/${supplierId}/revenue?from=${fromDate}&to=${toDate}`),
        axios.get(`http://localhost:5000/orders/supplier/${supplierId}/daily-revenue?from=${fromDate}&to=${toDate}`),
        axios.get(`http://localhost:5000/orders/supplier/${supplierId}/top-products?from=${fromDate}&to=${toDate}`),
        axios.get(`http://localhost:5000/orders/supplier/${supplierId}/order-status?from=${fromDate}&to=${toDate}`),
      ]);
      setRevenueData(rev.data);
      setDailyRevenue(dailyRev.data);
      setTopProducts(topProd.data);
      setOrderStatusData(status.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_ORDER = ['Hoàn thành', 'Đang giao hàng', 'Giao thất bại', 'Đã xác nhận', 'Chờ xác nhận'];
  const STATUS_COLORS: Record<string, string> = {
    'Hoàn thành': '#10b981',
    'Đang giao hàng': '#3b82f6',
    'Giao thất bại': '#ef4444',
    'Đã xác nhận': '#f59e0b',
    'Chờ xác nhận': '#8b5cf6',
  };

  if (loading || !supplierId) {
    return (
      <div className="text-center mt-12 text-indigo-600 text-lg font-semibold animate-pulse">
        Đang tải dữ liệu thống kê...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-700 uppercase tracking-wide">
        📊 Thống kê doanh thu nhà cung cấp
      </h2>

      <div className="flex flex-wrap gap-4 justify-center">
        <DateInput label="Từ ngày" value={fromDate} onChange={setFromDate} />
        <DateInput label="Đến ngày" value={toDate} onChange={setToDate} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Tổng doanh thu" value={`${revenueData.totalRevenue.toLocaleString()} đ`} color="green" />
        <StatCard label="Sản phẩm đã bán" value={revenueData.totalProductsSold} color="blue" />
        <StatCard label="Đơn hàng hoàn thành" value={revenueData.totalOrdersCount} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="📈 Doanh thu theo ngày">
          <Chart
            type="bar"
            height={300}
            series={[{ name: 'Doanh thu', data: dailyRevenue.map((d) => d.revenue) }]}
            options={{
              chart: { toolbar: { show: false } },
              xaxis: { categories: dailyRevenue.map((d) => d.date) },
              colors: ['#34d399'],
              plotOptions: { bar: { borderRadius: 8, columnWidth: '50%' } },
              fill: {
                type: 'gradient',
                gradient: {
                  type: 'vertical',
                  shade: 'light',
                  gradientToColors: ['#10b981'],
                  opacityFrom: 0.9,
                  opacityTo: 1,
                  stops: [0, 100],
                },
              },
              tooltip: {
                y: { formatter: (val: number) => `${val.toLocaleString()} đ` },
              },
              yaxis: {
                labels: { formatter: (val: number) => `${val / 1000}K` },
              },
              dataLabels: { enabled: false },
            }}
          />
        </ChartCard>

        <ChartCard title="📉 Doanh thu (biểu đồ đường hiện đại)">
          <Chart
            type="line"
            height={300}
            series={[{ name: 'Doanh thu', data: dailyRevenue.map((d) => d.revenue) }]}
            options={{
              chart: {
                toolbar: { show: false },
                zoom: { enabled: false },
              },
              stroke: {
                curve: 'smooth',
                width: 3,
              },
              markers: {
                size: 5,
                colors: ['#ffffff'],
                strokeColors: '#10b981',
                strokeWidth: 2,
                hover: { size: 7 },
              },
              colors: ['#10b981'],
              xaxis: {
                categories: dailyRevenue.map((d) => d.date),
                labels: { rotate: -45 },
              },
              yaxis: {
                labels: { formatter: (val: number) => `${val / 1000}K` },
              },
              tooltip: {
                y: { formatter: (val: number) => `${val.toLocaleString()} đ` },
              },
              grid: { strokeDashArray: 4 },
              dataLabels: { enabled: false },
            }}
          />
        </ChartCard>

        <ChartCard title="🔥 Top sản phẩm bán chạy">
          <Chart
            type="bar"
            height={300}
            series={[{ name: 'Đã bán', data: topProducts.map((p) => p.sold) }]}
            options={{
              chart: { toolbar: { show: false } },
              plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '50%' } },
              xaxis: { categories: topProducts.map((p) => p.name) },
              colors: ['#3b82f6'],
              fill: {
                type: 'gradient',
                gradient: {
                  type: 'horizontal',
                  gradientToColors: ['#60a5fa'],
                  opacityFrom: 0.9,
                  opacityTo: 1,
                  stops: [0, 100],
                },
              },
              tooltip: {
                y: { formatter: (val: number) => `${val} lượt` },
              },
              dataLabels: { enabled: false },
            }}
          />
        </ChartCard>

        <ChartCard title="📊 Trạng thái đơn hàng">
          <Chart
            type="donut"
            height={300}
            options={{
              labels: STATUS_ORDER,
              colors: STATUS_ORDER.map(status => STATUS_COLORS[status]),
              legend: { position: 'bottom' },
            }}
            series={STATUS_ORDER.map(status => {
              const item = orderStatusData.find(o => o.status === status);
              return item ? item.count : 0;
            })}
          />
          <div className="mt-4 text-sm space-y-2">
            {STATUS_ORDER.map((status) => {
              const item = orderStatusData.find(o => o.status === status);
              if (!item) return null;
              const total = orderStatusData.reduce((sum, s) => sum + s.count, 0);
              const percent = ((item.count / total) * 100).toFixed(1);
              return (
                <p key={status} className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }}></span>
                  <span className="text-gray-700 font-medium">{status}:</span>
                  <span className="text-gray-600">{item.count} đơn ({percent}%)</span>
                </p>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

const DateInput = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

const StatCard = ({ label, value, color }: { label: string; value: any; color: string }) => (
  <div className={classNames(`bg-white rounded-xl shadow-md p-6 border-l-4`, `border-${color}-500`)}>
    <p className="text-sm text-gray-600">{label}</p>
    <h3 className={classNames(`text-3xl font-bold mt-2`, `text-${color}-600`)}>{value}</h3>
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl p-6 shadow-md border">
    <h4 className="text-lg font-semibold mb-4 text-gray-700">{title}</h4>
    {children}
  </div>
);
