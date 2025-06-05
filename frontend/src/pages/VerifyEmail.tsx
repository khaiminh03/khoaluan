import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [status, setStatus] = useState("⏳ Đang xác minh tài khoản...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("❌ Thiếu token xác minh.");
      return;
    }

    axios
      .get(`http://localhost:5000/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("✅ Tài khoản đã được xác minh thành công!");
        setTimeout(() => navigate("/login"), 3000); // Tự động chuyển hướng
      })
      .catch(() => setStatus("❌ Token không hợp lệ hoặc đã hết hạn."));
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-lg font-medium text-gray-700">
      <div className="bg-white px-6 py-8 rounded shadow-md text-center">
        <p>{status}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
