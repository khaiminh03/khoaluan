import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

const AdminLayout = () => {
  const location = useLocation();

  // ✅ Log đường dẫn mỗi khi thay đổi
  useEffect(() => {
    console.log("📍 Current pathname:", location.pathname);
  }, [location.pathname]);

  const sidebarLinks = [
    { name: "Quản lý người dùng", path: "/admin/add-user" },
    { name: "Duyệt nhà cung cấp", path: "/admin/supplier" },
    { name: "Quản lý danh mục", path: "/admin/category" },
    { name: "Quản lý sản phẩm", path: "/admin/allproduct" },
    { name: "Quản lý đơn hàng", path: "/admin/adminorder" },
    { name: "Thống kê", path: "/admin/adminrevenue" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user_info");
    window.location.replace("/"); // Quay về trang chủ
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
        {/* ✅ Sửa: dùng Link thay vì <a> để tránh reload */}
        <Link to="/">
          <img
            className="h-9"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/dummyLogo/dummyLogoColored.svg"
            alt="Logo"
          />
        </Link>
        <div className="flex items-center gap-5 text-gray-500">
          <p>Hi! Admin</p>
          <button
            onClick={handleLogout}
            className="border rounded-full text-sm px-4 py-1"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Sidebar + Nội dung */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="md:w-64 w-16 border-r h-screen text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
          {sidebarLinks.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={`flex items-center py-3 px-4 gap-3 ${
                location.pathname.startsWith(item.path)
                  ? "border-r-4 md:border-r-[6px] bg-indigo-500/10 border-indigo-500 text-indigo-500"
                  : "hover:bg-gray-100/90 border-white text-gray-700"
              }`}
            >
              <p className="md:block hidden text-center">{item.name}</p>
            </Link>
          ))}
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
