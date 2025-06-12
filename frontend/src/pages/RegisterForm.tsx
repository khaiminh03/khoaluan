import { useState } from "react";
import axios from "axios";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/auth/register", formData);
      console.log("✅ Đăng ký thành công:", response.data);

      alert("🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
      setFormData({ email: "", password: "" });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      console.error("❌ Lỗi đăng ký:", message);
      alert(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">🔐 Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Nhập email của bạn"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Tối thiểu 6 ký tự"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 font-semibold text-white rounded-xl transition-all ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-500">
        Đã có tài khoản? <a href="/login" className="text-blue-600 hover:underline">Đăng nhập</a>
      </p>
    </div>
  );
}
