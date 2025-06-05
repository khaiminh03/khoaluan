import { useEffect, useState } from "react";

interface User {
  name?: string;
  phone?: string;
  address?: string;
}

interface Product {
  _id?: string;
  name: string;
  images: string[];
}

interface Supplier {
  _id: string;
  name: string;
}

interface OrderItem {
  productId: Product;
  supplierId: Supplier;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  customerId?: User;
  shippingAddress?: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("http://localhost:5000/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);

        const supplierMap = new Map<string, string>();
        data.forEach((order: Order) => {
          order.items.forEach((item) => {
            if (item.supplierId && typeof item.supplierId === 'object') {
              supplierMap.set(item.supplierId._id, item.supplierId.name);
            }
          });
        });
        setSupplierOptions(Array.from(supplierMap, ([id, name]) => ({ _id: id, name })));
      } else {
        console.error("Không lấy được đơn hàng");
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchStatus = !statusFilter || order.status === statusFilter;
    const matchFromDate = !fromDate || new Date(order.createdAt) >= new Date(fromDate);
    const matchToDate = !toDate || new Date(order.createdAt) <= new Date(toDate);
    const matchSupplier = !supplierFilter || order.items.some(i => i.supplierId._id === supplierFilter);
    return matchStatus && matchFromDate && matchToDate && matchSupplier;
  });

  return (
    <div className="mt-2 px-4 md:px-8 pb-20 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">QUẢN LÍ ĐƠN HÀNG TOÀN HỆ THỐNG</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Lọc theo trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="Đã đặt hàng">🕒 Chờ xác nhận</option>
            <option value="Đã xác nhận">✅ Đã xác nhận</option>
            <option value="Đang giao hàng">🚚 Đang giao</option>
            <option value="Hoàn thành">🎉 Hoàn thành</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Lọc theo nhà cung cấp</label>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            {supplierOptions.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Từ ngày</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Đến ngày</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Không có đơn hàng nào.</p>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl p-6 mb-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Mã đơn:</span> {order._id}
              </div>
              <div className="text-sm text-gray-500">
                Ngày đặt: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
              <div className="space-y-1">
                <p><span className="font-medium">👤 Người đặt:</span> {order.customerId?.name || "Ẩn"}</p>
                <p><span className="font-medium">📞 SĐT:</span> {order.customerId?.phone || "Ẩn"}</p>
              </div>
              <div className="space-y-1">
                <p><span className="font-medium">📍 Địa chỉ:</span> {order.shippingAddress || "Không có"}</p>
                <p><span className="font-medium">💳 Thanh toán:</span> {order.paymentMethod}</p>
              </div>
            </div>

            <details>
              <summary className="text-indigo-600 cursor-pointer">📦 Xem chi tiết sản phẩm</summary>
              <div className="space-y-4 mt-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img
                      src={
                        item.productId?.images?.[0]
                          ? `http://localhost:5000/uploads/products/${item.productId.images[0]}`
                          : "/no-image.png"
                      }
                      alt={item.productId?.name || "Product"}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.productId.name}</p>
                      <p className="text-sm text-gray-500">Nhà cung cấp: {item.supplierId.name}</p>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Giá: {item.price.toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>

            <div className="text-lg font-bold text-indigo-600 mt-4">
              Tổng: {order.totalAmount.toLocaleString()}đ
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrders;
