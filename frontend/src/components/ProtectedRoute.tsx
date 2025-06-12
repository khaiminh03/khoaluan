import React from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const ProtectedRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) => {
  const { user } = useAppContext();

  // ⏳ Chờ context khởi tạo
  if (user === null && !localStorage.getItem("accessToken")) {
    return <Navigate to="/login" replace />;
  }

  // 👤 Nếu user chưa sẵn sàng nhưng có token => hiển thị loading
  if (user === null && localStorage.getItem("accessToken")) {
    return (
      <div className="p-10 text-center text-gray-500">🔄 Đang xác thực người dùng...</div>
    );
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Pass qua
  return <>{children}</>;
};

export default ProtectedRoute;
