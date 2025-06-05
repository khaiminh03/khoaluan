import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

interface Category {
  name: string;
}

interface Product {
  _id?: string;
  name: string;
  images: string[];
  categoryId?: Category;
}

interface OrderItem {
  productId: Product;
  quantity: number;
  isReviewed?: boolean;
}

interface Order {
  _id: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const rawUser = JSON.parse(localStorage.getItem("user_info") || "{}");
      const userInfo = Array.isArray(rawUser) ? rawUser[0] : rawUser;
      const userId = userInfo._id || userInfo.sub;
      if (!userId) return;

      const res = await fetch(`http://localhost:5000/orders/customer/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        console.error("Không lấy được đơn hàng");
      }
    };

    fetchOrders();
  }, []);

  const handleSubmitReview = async () => {
    if (!selectedProductId || !selectedOrderId || !rating) return;
    const token = localStorage.getItem("accessToken");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProductId,
          orderId: selectedOrderId,
          rating,
          comment,
        }),
      });

      if (res.status === 401) {
        alert("Bạn cần đăng nhập để đánh giá.");
        return;
      }

      if (res.ok) {
        alert("Đánh giá thành công!");
        setOpen(false);
        setComment("");
        setRating(5);

        const updatedOrders = orders.map((order) => {
          if (order._id === selectedOrderId) {
            order.items = order.items.map((item) => {
              if (String(item.productId._id) === selectedProductId) {
                return { ...item, isReviewed: true };
              }
              return item;
            });
          }
          return order;
        });
        setOrders(updatedOrders);
      } else {
        const error = await res.json();
        alert("Lỗi: " + (error.message || "Đánh giá thất bại!"));
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 pb-16 px-4 max-w-5xl mx-auto">
      <div className="flex flex-col items-start mb-8">
        <p className="text-2xl font-bold uppercase">Đơn hàng của bạn</p>
        <div className="w-16 h-0.5 bg-indigo-600 rounded-full"></div>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="flex flex-col border border-gray-200 rounded-lg p-6 mb-6 shadow-sm"
          >
            <p className="text-sm text-gray-500 mb-2">
              <strong>OrderId :</strong> {order._id} - <strong>Trạng thái:</strong> {order.status}
            </p>

            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 mb-4">
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded overflow-hidden border">
                  <img
                    src={
                      item.productId?.images?.[0]
                        ? `http://localhost:5000/uploads/products/${item.productId.images[0]}`
                        : "/no-image.png"
                    }
                    alt={item.productId?.name || "Product"}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <p className="text-lg font-semibold text-gray-900">{item.productId?.name || "Product"}</p>
                  <p className="text-sm text-gray-500">
                    Category: {item.productId?.categoryId?.name || "N/A"}
                  </p>
                  <p className="text-sm">Số lượng: {item.quantity}</p>

                  {item.isReviewed ? (
                    <p className="text-green-600 text-sm mt-1">✅ Đã đánh giá</p>
                  ) : order.status === "Hoàn thành" && (
                    <button
                      onClick={() => {
                        setOpen(true);
                        setSelectedProductId(item.productId?._id || null);
                        setSelectedOrderId(order._id);
                      }}
                      className="mt-2 px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 w-fit"
                    >
                      Đánh giá
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="text-sm text-gray-600 text-right">
              <p>Ngày: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
              <p className="text-green-600 font-semibold text-base mt-1">
                Tổng cộng: ${order.totalAmount}
              </p>
            </div>
          </div>
        ))
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{ p: 4, bgcolor: "white", width: 400, mx: "auto", mt: "15vh", borderRadius: 2 }}>
          <h2 className="text-xl font-semibold mb-4">Đánh giá sản phẩm</h2>
          <Rating value={rating} onChange={(_, newValue) => setRating(newValue)} />
          <TextField
            label="Nội dung đánh giá"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-4"
          />
          <Button onClick={handleSubmitReview} variant="contained" sx={{ mt: 2 }} disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default MyOrders;
