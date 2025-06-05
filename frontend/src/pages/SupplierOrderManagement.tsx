import { useEffect, useState } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

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

interface OrderItem {
  productId: Product;
  supplierId: string;
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

const SupplierOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const supplierInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
  const supplierId = supplierInfo.sub;

  const fetchOrders = async () => {
    if (!supplierId) return;
    const res = await fetch(`http://localhost:5000/orders/supplier/${supplierId}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    } else {
      console.error("Không lấy được đơn hàng của nhà cung cấp");
    }
  };

  fetchOrders();
}, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error("Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="mt-2 px-4 md:px-8 pb-20 max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">QUẢN LÍ ĐƠN HÀNG</h1>

    {orders.length === 0 ? (
      <p className="text-center text-gray-500 text-lg">Không có đơn hàng nào.</p>
    ) : (
      orders.map((order) => (
        <div
          key={order._id}
          className="bg-white rounded-xl p-6 mb-6 shadow-md hover:shadow-lg transition-shadow"
        >
          {/* Thông tin đơn hàng */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">Mã đơn:</span> {order._id}
            </div>
            <div className="text-sm text-gray-500">
              Ngày đặt: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Người đặt + Địa chỉ */}
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

          {/* Danh sách sản phẩm */}
          <div className="space-y-4 mb-4">
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
                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  <p className="text-sm text-gray-500">Giá: {item.price.toLocaleString()}đ</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng & Trạng thái */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-lg font-bold text-indigo-600">
              Tổng: {order.totalAmount.toLocaleString()}đ
            </div>

            <FormControl size="small" className="w-full md:w-64">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={order.status || ""}
                label="Trạng thái"
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                disabled={loading || order.status === "Hoàn thành"}
              >
                <MenuItem value="Đã đặt hàng">🕒 Chờ xác nhận</MenuItem>
                <MenuItem value="Đã xác nhận">✅ Đã xác nhận</MenuItem>
                <MenuItem value="Đang giao hàng">🚚 Đang giao</MenuItem>
                <MenuItem value="Hoàn thành">🎉 Hoàn thành</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      ))
    )}
  </div>
);


};

export default SupplierOrders;
