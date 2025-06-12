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
  shippingStatus: string;
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
    const supplierId = supplierInfo._id;

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
    const res = await fetch(`http://localhost:5000/orders/${orderId}/shipping-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shippingStatus: newStatus }),
    });

    if (res.ok) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                shippingStatus: newStatus,
                status: newStatus === "Hoàn thành" ? "Đã thanh toán" : order.status,
              }
            : order
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
      <h1 className="text-3xl font-extrabold text-gray-800 mb-10 text-center">QUẢN LÍ ĐƠN HÀNG</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Không có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Thông tin đơn */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 text-sm text-gray-600">
              <div><span className="font-semibold text-gray-800">Mã đơn:</span> {order._id}</div>
              <div>Ngày đặt: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span></div>
            </div>

            {/* Khách hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
              <div className="space-y-1">
                <p><span className="font-medium">Người đặt:</span> {order.customerId?.name || "Ẩn"}</p>
                <p><span className="font-medium">SĐT:</span> {order.customerId?.phone || "Ẩn"}</p>
              </div>
              <div className="space-y-1">
                <p><span className="font-medium">Địa chỉ:</span> {order.shippingAddress || "Không có"}</p>
                <p><span className="font-medium">Phương thức thanh toán:</span> {order.paymentMethod}</p>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="divide-y divide-gray-100 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 py-3">
                  <img
                    src={
                      item.productId?.images?.[0]
                        ? `http://localhost:5000/uploads/products/${item.productId.images[0]}`
                        : "/no-image.png"
                    }
                    alt={item.productId?.name || "Product"}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-500/30"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.productId.name}</p>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Giá: {item.price.toLocaleString('vi-VN')}₫</p>
                    
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng & Trạng thái */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-lg font-bold text-green-600">Thành tiền: {order.totalAmount.toLocaleString('vi-VN')}₫</p>
                <p className="text-sm text-gray-700 mt-1">
                  Thanh toán: <span className="font-medium text-green-600">{order.status}</span>
                </p>
              </div>
              
              <FormControl
                size="small"
                className={`w-full md:w-64 rounded-md shadow-sm ${
                  order.shippingStatus === "Hoàn thành"
                    ? "bg-green-100 border border-green-500"
                    : order.shippingStatus === "Giao thất bại"
                    ? "bg-red-100 border border-red-500"
                    : "bg-gray-50 border border-gray-300"
                }`}
              >
                <InputLabel id={`status-label-${order._id}`} className="!text-gray-700 text-sm font-medium">
                  Trạng thái vận chuyển
                </InputLabel>
                <Select
                  labelId={`status-label-${order._id}`}
                  value={order.shippingStatus || ""}
                  label="Trạng thái vận chuyển"
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  disabled={
                    loading ||
                    order.shippingStatus === "Hoàn thành" ||
                    order.shippingStatus === "Giao thất bại"
                  }
                  className="rounded text-sm"
                  sx={{
                    fontWeight: 500,
                    color:
                      order.shippingStatus === "Hoàn thành"
                        ? "#15803d"
                        : order.shippingStatus === "Giao thất bại"
                        ? "#b91c1c"
                        : "#1f2937",
                    '& .MuiSelect-icon': {
                      color:
                        order.shippingStatus === "Hoàn thành"
                          ? "#15803d"
                          : order.shippingStatus === "Giao thất bại"
                          ? "#b91c1c"
                          : "#4b5563",
                    },
                  }}
                >
                  <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                  <MenuItem value="Đã xác nhận">Đã xác nhận</MenuItem>
                  <MenuItem value="Đang giao hàng">Đang giao</MenuItem>
                  {order.status !== "Đã thanh toán" && (
                    <MenuItem value="Giao thất bại">Giao thất bại</MenuItem>
                  )}
                  <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
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