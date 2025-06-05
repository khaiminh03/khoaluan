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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng ký</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white p-3 rounded-xl transition-all ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}
