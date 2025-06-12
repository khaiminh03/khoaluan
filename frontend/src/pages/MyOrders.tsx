import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";

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
  shippingStatus: string;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProductId,
        orderId: selectedOrderId,
        rating,
        comment,
        accessToken: token,
      }),
    });

    if (res.ok) {
      toast.success("Đánh giá thành công");
      setOpen(false);
      setComment("");
      setRating(5);

      // ✅ Cập nhật lại đơn hàng từ server để đảm bảo state chính xác
      const updatedOrderRes = await fetch(`http://localhost:5000/orders/${selectedOrderId}`);
      if (updatedOrderRes.ok) {
        const updatedOrder = await updatedOrderRes.json();
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      }
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
        <p className="text-2xl font-bold uppercase text-gray-800">Đơn hàng của bạn</p>
        <div className="w-16 h-0.5 bg-green-600 rounded-full mt-1"></div>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="border border-gray-300 bg-white rounded-xl shadow-sm p-5 mb-6 space-y-4">
            <div className="text-sm text-gray-500">
              <strong>Mã đơn:</strong> {order._id}
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="space-y-2">
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.productId?.images?.[0]
                        ? `http://localhost:5000/uploads/products/${item.productId.images[0]}`
                        : "/no-image.png"}
                      alt="product"
                      className="w-16 h-16 object-cover rounded border border-gray-500/30"
                    />
                    <div>
                      <p className="font-semibold">{item.productId?.name}</p>
                      <p className="text-sm text-gray-500">Danh mục: {item.productId?.categoryId?.name || "N/A"}</p>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Chỉ hiện 1 dòng trạng thái đánh giá cho toàn đơn */}
            <div className="text-sm">
              {order.status === "Đã thanh toán" && order.shippingStatus === "Hoàn thành" && (
                order.items.some((item) => !item.isReviewed) ? (
                  <p className="text-red-500 font-medium">Chưa đánh giá</p>
                ) : (
                  <p className="text-green-600 font-medium">Đã đánh giá</p>
                )
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-1">
                <p><strong>Phương thức:</strong> {order.paymentMethod}</p>
                <p><strong>Vận chuyển:</strong> {order.shippingStatus}</p>
                <p><strong>Trạng thái:</strong> {order.status}</p>
                <p><strong>Ngày:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-end items-end text-green-600 font-bold text-base">
                Thành tiền: {order.totalAmount.toLocaleString("vi-VN")} ₫
              </div>
            </div>

            {order.status === "Đã thanh toán" &&
              order.shippingStatus === "Hoàn thành" &&
              order.items.some(item => !item.isReviewed) && (
                <div className="text-right">
                  <button
                    onClick={() => {
                      const firstUnreviewed = order.items.find(i => !i.isReviewed);
                      if (firstUnreviewed) {
                        setSelectedProductId(firstUnreviewed.productId?._id || null);
                        setSelectedOrderId(order._id);
                        setOpen(true);
                      }
                    }}
                    className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Đánh giá sản phẩm
                  </button>
                </div>
            )}
          </div>
        ))
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="bg-white w-[90%] max-w-md mx-auto mt-[12vh] p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-center">Đánh giá sản phẩm</h2>
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
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            className="!bg-green-600 hover:!bg-green-700 w-full mt-4"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default MyOrders;
