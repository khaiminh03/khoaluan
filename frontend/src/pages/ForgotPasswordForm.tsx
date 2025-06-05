import { useState } from "react";
import axios from "axios";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/auth/forgot-password", { email });
      setStatus("Yêu cầu đã được gửi. Vui lòng kiểm tra hộp thư để đặt lại mật khẩu.");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể gửi yêu cầu. Vui lòng thử lại.";
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white w-full max-w-[360px] rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.05)] p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Quên mật khẩu
        </h2>

        <p className="text-sm text-gray-600 mb-6 text-center">
          Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border border-gray-300 bg-gray-50 rounded-full px-4 py-2.5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onInvalid={(e) =>
                (e.target as HTMLInputElement).setCustomValidity("Vui lòng nhập email.")
              }
              onInput={(e) =>
                (e.target as HTMLInputElement).setCustomValidity("")
              }
              required
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-full font-medium transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-sm text-center text-gray-700">{status}</p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
