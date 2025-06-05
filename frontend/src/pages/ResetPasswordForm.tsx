import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setStatus("❌ Token không tồn tại.");

    try {
      await axios.put(`http://localhost:5000/auth/reset-password?token=${token}`, {
        newPassword,
      });
      setStatus("✅ Mật khẩu đã được cập nhật!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "❌ Không thể cập nhật mật khẩu.";
      setStatus(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">🔒 Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded-xl p-3"
          required
          minLength={6}
        />
        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700">
          Cập nhật mật khẩu
        </button>
      </form>
      {status && <p className="mt-4 text-center text-sm text-gray-700">{status}</p>}
    </div>
  );
};

export default ResetPasswordForm;
