import { Link, Outlet, useLocation} from "react-router-dom";
import { assets } from "../assets/assets";

const SellerLayout = () => {
  const location = useLocation();


  const sidebarLinks = [
    { name: "Thêm sản phẩm", path: "/seller/add-product" },
    { name: "Danh sách sản phẩm", path: "/seller/overview" },
    { name: "Đơn hàng", path: "/seller/order" },
    { name: "Danh thu", path: "/seller/revenue" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user_info");
    window.location.replace("/"); 
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
        <a href="#">
          <img
            className="h-9"
            src={assets.logoe}
            alt="dummyLogoColored"
          />
        </a>
        <div className="flex items-center gap-5 text-gray-500">
          <p>Hi! Supplier</p>
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
                location.pathname === item.path
                  ? "border-r-4 md:border-r-[6px] bg-green-500/10 border-green-500 text-green-500"
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

export default SellerLayout;
