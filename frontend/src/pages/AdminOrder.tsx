import { useEffect, useState } from "react";

interface Category {
  name: string;
}
interface User {
  name?: string;
  phone?: string;
  address?: string;
}
interface Product {
  _id?: string;
  name: string;
  images: string[];
  categoryId?: Category;
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
  shippingStatus: string;
}
interface Store {
  _id: string;
  userId: { _id: string };
  storeName: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([]);
  const [storeMap, setStoreMap] = useState<{ [userId: string]: string }>({});

  useEffect(() => {
    const fetchStores = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/store-profiles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const stores: Store[] = await res.json();
        const map: { [id: string]: string } = {};
        stores.forEach((store) => {
          if (store.userId && typeof store.userId === "object") {
            map[store.userId._id] = store.storeName;
          }
        });
        setStoreMap(map);
      } else {
        console.error("Không thể lấy danh sách cửa hàng", await res.text());
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("http://localhost:5000/orders");
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);

        const supplierSet = new Set<string>();
        const supplierList: Supplier[] = [];

        data.forEach((order) => {
          order.items.forEach((item) => {
            const id = String(item.supplierId._id);
            if (!supplierSet.has(id)) {
              supplierSet.add(id);
              supplierList.push({
                _id: id,
                name: storeMap[id] || "Không rõ",
              });
            }
          });
        });

        setSupplierOptions(supplierList);
      } else {
        console.error("Không lấy được đơn hàng");
      }
    };
    fetchOrders();
  }, [storeMap]);

  const filteredOrders = orders.filter((order) => {
    const matchPayment = !paymentStatusFilter || order.status === paymentStatusFilter;
    const matchFromDate = !fromDate || new Date(order.createdAt) >= new Date(fromDate);
    const matchToDate = !toDate || new Date(order.createdAt) <= new Date(toDate);
    const matchSupplier =
      !supplierFilter || order.items.some((i) => String(i.supplierId._id) === supplierFilter);
    return matchPayment && matchFromDate && matchToDate && matchSupplier;
  });

  return (
    <div className="mt-2 px-4 md:px-8 pb-20 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">QUẢN LÍ ĐƠN HÀNG TOÀN HỆ THỐNG</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Trạng thái thanh toán</label>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="w-full border border-gray-500/30 rounded px-3 py-2"
          >
            <option value="">Tất cả</option>
            <option value="Chưa thanh toán">Chưa thanh toán</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Lọc theo nhà cung cấp</label>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full border border-gray-500/30 rounded px-3 py-2"
          >
            <option value="">Tất cả</option>
            {supplierOptions.map((s) => (
              <option key={s._id} value={s._id}>
                {storeMap[s._id] || "Không rõ"}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-500/30 px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-500/30 px-3 py-2 rounded"
            />
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Không có đơn hàng nào.</p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order._id} className="border border-gray-500/30 bg-white rounded-xl p-6 mb-6 shadow">
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span><strong>Mã đơn:</strong> {order._id}</span>
              <span><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 mb-3">
              <div>
                <p><strong>Người đặt:</strong> {order.customerId?.name || "Chưa có"}</p>
                <p><strong>SĐT:</strong> {order.customerId?.phone || "Chưa có"}</p>
              </div>
              <div>
                <p><strong>Địa chỉ:</strong> {order.shippingAddress || "Không có"}</p>
                <p><strong>Thanh toán:</strong> {order.paymentMethod}</p>
              </div>
            </div>

            <details>
              <summary className="text-green-600 cursor-pointer">Xem chi tiết sản phẩm</summary>
              <div className="mt-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start mb-4">
                    <img
                      src={item.productId.images?.[0]
                        ? `http://localhost:5000/uploads/products/${item.productId.images[0]}`
                        : "/no-image.png"}
                      alt="product"
                      className="w-16 h-16 object-cover border border-gray-500/30 rounded"
                    />
                    <div>
                      <p className="font-semibold">{item.productId.name}</p>
                      <p className="text-sm text-gray-500">
                        Danh mục: {item.productId.categoryId?.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                ))}

                <div className="grid md:grid-cols-2 mt-4 gap-4 text-sm text-gray-700">
                  <div>
                    <p><strong>Phương thức:</strong> {order.paymentMethod}</p>
                    <p><strong>Vận chuyển:</strong> {order.shippingStatus}</p>
                  </div>
                  <div>
                    <p><strong>Trạng thái:</strong> {order.status}</p>
                    <p><strong>Ngày:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="text-right font-bold text-green-600 mt-2">
                  Thành tiền: {order.totalAmount.toLocaleString("vi-VN")}₫
                </div>
              </div>
            </details>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrders;
