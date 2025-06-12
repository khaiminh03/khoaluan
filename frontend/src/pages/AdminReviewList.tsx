import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userId: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  productId: {
    name: string;
  };
}

const AdminReviewList = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:5000/reviews/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá đánh giá này không?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:5000/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReviews(reviews.filter((r) => r._id !== id));
      } else {
        alert("Xoá không thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi xoá đánh giá", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 uppercase">
        Đánh giá sản phẩm
      </h2>

      {loading ? (
        <div className="text-center text-blue-600 text-lg font-semibold animate-pulse">Đang tải dữ liệu...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-500 text-lg italic">Không có đánh giá nào.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className="text-gray-600 text-left">
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Số sao</th>
                <th className="px-4 py-3">Bình luận</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center gap-3 min-w-[220px]">
                    <img
                      src={
                        review.userId.avatarUrl
                          ? review.userId.avatarUrl.startsWith("http")
                            ? review.userId.avatarUrl
                            : `http://localhost:5000${review.userId.avatarUrl}`
                          : "/default-avatar.jpg"
                      }
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-gray-500/30"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">{review.userId.name}</div>
                      <div className="text-xs text-gray-500">{review.userId.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">{review.productId.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold text-xs">
                      ⭐ {review.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-sm text-gray-700">
                    <div className="max-h-16 overflow-y-auto whitespace-pre-wrap pr-1">
                      {review.comment || <span className="italic text-gray-400">Không có</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      title="Xoá đánh giá"
                      onClick={() => handleDelete(review._id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReviewList;
