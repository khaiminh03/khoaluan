import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Modal, Box, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
const Navbar = () => {
  
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const navigate = useNavigate();

  // Kiểm tra login và lấy user info từ localStorage
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
      if (!token) {
        setHasRegistered(false);
        setUserInfo(null);
      } else {
        const storedUser = localStorage.getItem("user_info");
        if (storedUser) setUserInfo(JSON.parse(storedUser));
      }
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

   // ✅ Listen and update cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
      setCartCount(total);
    };

    updateCartCount(); // initial
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);
    const isValidPhoneNumber = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };
  // Hàm thay đổi: mở modal login thay vì navigate đến /login
  const handleAuthClick = () => {
    if (isLoggedIn) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_info");
      setIsLoggedIn(false);
      setHasRegistered(false);
      setUserInfo(null);
      navigate("/");
      window.dispatchEvent(new Event("storage"));
    } else {
      window.location.href = "/login";
    }
  };


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setOpen(false);
    }
  };

  // Xử lý trở thành nhà cung cấp
  const handleRegisterSupplier = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/store-profiles/my-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        const data = await res.json();

        if (data.isApproved) {
          toast.success("Bạn đã là nhà cung cấp được duyệt."); 
          setHasRegistered(true);
          setShowSupplierModal(false);
          return;
        }

        if (data.isComplete) {
          toast.success("Bạn đã đăng ký. Vui lòng chờ admin duyệt");
          setHasRegistered(true);
          setShowSupplierModal(false);
          return;
        }

        setHasRegistered(false);
        setStoreName(data.storeName || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setShowSupplierModal(true);
      } else if (res.status === 404) {
        setHasRegistered(false);
        setStoreName("");
        setPhone("");
        setAddress("");
        setShowSupplierModal(true);
      } else {
        toast.error("Lỗi khi kiểm tra trạng thái nhà cung cấp.");
        setShowSupplierModal(false);
      }
    } catch {
      toast.error("Lỗi khi lấy thông tin nhà cung cấp.");
      setShowSupplierModal(false);
    }
  };

  // Gửi đăng ký nhà cung cấp
const handleSubmitRegister = async () => {
  if (loading) return;

  if (hasRegistered) {
    toast.success("Bạn đã đăng ký rồi, không thể gửi lại.");
    return;
  }

  if (!storeName.trim() || !phone.trim() || !address.trim()) {
    toast.warn("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  // ✅ Kiểm tra định dạng số điện thoại
  if (!isValidPhoneNumber(phone.trim())) {
    toast.warn("Số điện thoại phải có đúng 10 chữ số.");
    return;
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    navigate("/login");
    return;
  }

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("storeName", storeName.trim());
    formData.append("phone", phone.trim());
    formData.append("address", address.trim());
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch("http://localhost:5000/store-profiles", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      toast.success("Đăng ký thành công! Vui lòng chờ admin duyệt.");
      setShowSupplierModal(false);
      setStoreName("");
      setPhone("");
      setAddress("");
      setImageFile(null);
      setImagePreview(null);
      setHasRegistered(true);
    } else {
      const errorData = await response.json();
      if (
        errorData.message &&
        errorData.message.toLowerCase().includes("đăng ký nhà cung cấp rồi")
      ) {
        toast.success("Bạn đã gửi đăng ký rồi, vui lòng chờ admin duyệt.");
        setHasRegistered(true);
        setShowSupplierModal(false);
      } else {
        toast.error("Lỗi: " + (errorData.message || response.statusText));
      }
    }
  } catch {
    toast.error("Lỗi hệ thống khi gửi đăng ký!");
  } finally {
    setLoading(false);
  }
};


  // Cập nhật thông tin cá nhân
 const handleUpdateProfile = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    toast.error("Bạn chưa đăng nhập");
    navigate("/login");
    return;
  }

  if (!userInfo) {
    toast.warn("Không có thông tin người dùng trong localStorage");
    return;
  }

  const userId = userInfo._id;
  if (!userId) {
    toast.warn("Không tìm thấy ID người dùng để cập nhật.");
    return;
  }

  setProfileLoading(true);

  try {
    const formData = new FormData();
    formData.append("name", userInfo.name || "");
    formData.append("phone", userInfo.phone || "");
    formData.append("address", userInfo.address || "");

    if (avatarFile) {
      formData.append("avatar", avatarFile); // đúng tên field backend đang nhận
    }

    const res = await fetch(`http://localhost:5000/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        // KHÔNG set Content-Type nếu dùng FormData
      },
      body: formData,
    });

    if (res.ok) {
      const updatedUser = await res.json();

      const newUserInfo = {
        ...updatedUser,
        _id: userId, 
      };

      localStorage.setItem("user_info", JSON.stringify(newUserInfo));
      setUserInfo(newUserInfo);
      toast.success("Cập nhật thông tin thành công!");
      setShowProfileModal(false);
    } else {
      const err = await res.json();
      toast.error("Lỗi cập nhật: " + (err.message || res.statusText));
    }
  } catch (err) {
    toast.error("Lỗi hệ thống khi cập nhật hồ sơ!");
  } finally {
    setProfileLoading(false);
  }
};
  return (
    <>
       <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
        <NavLink to="/">
          <img className="h-9" src={assets.logoe} alt="logo" />
        </NavLink>

        <div className="hidden sm:flex items-center gap-8">
          <NavLink to="/">Trang chủ</NavLink>
          <NavLink to="/products">Sản phẩm</NavLink>
          <NavLink to="/">Liên hệ</NavLink>

          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full"
          >
            <input
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
              type="text"
              placeholder="Tìm kiếm sản phẩm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" aria-label="Tìm kiếm">
              <img src={assets.search_icon} alt="search" className="w-4 h-4" />
            </button>
          </form>

          <div className="relative cursor-pointer">
            <img
              onClick={() => navigate("/cart")}
              src={assets.nav_cart_icon}
              alt="cart"
              className="w-6 opacity-80"
            />
            <button className="absolute -top-2 -right-3 text-xs text-white bg-green-500 w-[18px] h-[18px] rounded-full">
              {cartCount}
            </button>
          </div>

          {isLoggedIn ? (
            <div className="relative group">
              <img src={
                    userInfo?.avatarUrl
                      ? userInfo.avatarUrl.startsWith("http") || userInfo.avatarUrl.startsWith("data:")
                        ? userInfo.avatarUrl // nếu là base64 preview
                        : `http://localhost:5000${userInfo.avatarUrl}` // nếu là đường dẫn từ server
                      : assets.profile_icon
                  }
                  className="w-10 h-10 rounded-full cursor-pointer object-cover"
                  alt="profile"
                />
              <ul className="hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-40 rounded-md text-sm z-40">
                <li
                  onClick={() => setShowProfileModal(true)}
                  className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                >
                  Cập nhật thông tin
                </li>
               <li
                  onClick={() => navigate('/myorder')}
                  className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                >
                  Đơn hàng
                </li>
                <li
                  onClick={handleRegisterSupplier}
                  className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                >
                  Trở thành nhà cung cấp
                </li>
                <li
                  onClick={handleAuthClick}
                  className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                >
                  Đăng xuất
                </li>
              </ul>
            </div>
          ) : (
            <button
              onClick={handleAuthClick}
              className="cursor-pointer px-8 py-2 bg-green-500 hover:bg-green-600 transition text-white rounded-full"
            >
              Đăng nhập
            </button>
          )}
        </div>

        {/* Mobile */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className="sm:hidden"
        >
          <img src={assets.menu_icon} alt="menu" />
        </button>

        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm sm:hidden z-50`}
        >
          <NavLink to="/" className="block">
            Trang chủ
          </NavLink>
          <NavLink to="/spall" className="block">
            Sản phẩm
          </NavLink>
          <NavLink to="/" className="block">
            Liên hệ
          </NavLink>
          <button
            onClick={handleAuthClick}
            className="cursor-pointer px-6 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm"
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </div>
      </nav>
      {/* Modal đăng ký nhà cung cấp */}
      <Modal open={showSupplierModal} onClose={() => setShowSupplierModal(false)}>
  <Box className="bg-white rounded-2xl shadow-xl w-[90%] sm:w-[420px] mx-auto mt-[5%] p-6 outline-none ring-0">
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
      Đăng ký nhà cung cấp
    </h2>

    <div className="flex flex-col gap-5">
      <TextField
        fullWidth
        label="Tên cửa hàng"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
      />

      <TextField
        fullWidth
        label="Số điện thoại"
        type="tel"
        inputProps={{ maxLength: 10, pattern: "[0-9]*" }}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <TextField
        fullWidth
        label="Địa chỉ"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              const reader = new FileReader();
              reader.onloadend = () => {
                setImagePreview(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
          className="file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            text-sm text-gray-600"
        />
      </div>

      {imagePreview && (
        <div className="flex justify-center">
          <img
            src={imagePreview}
            alt="Ảnh xem trước"
            className="w-20 h-20 object-cover rounded-full border border-gray-300 shadow-sm"
          />
        </div>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmitRegister}
        disabled={loading || hasRegistered}
        fullWidth
        className="!mt-2 !bg-green-600 hover:!bg-green-700 transition-all"
      >
        {loading
          ? "Đang gửi..."
          : hasRegistered
          ? "Đã gửi đăng ký"
          : "Gửi đăng ký"}
      </Button>
    </div>
  </Box>
</Modal>


      {/* Modal cập nhật thông tin người dùng */}
     <Modal open={showProfileModal} onClose={() => setShowProfileModal(false)}>
  <Box className="bg-white rounded-2xl shadow-lg w-[90%] sm:w-[420px] mx-auto mt-[5%] p-6 outline-none ring-0">
    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
      Cập nhật thông tin
    </h2>

    <div className="flex flex-col gap-5">
      <TextField
        fullWidth
        label="Tên"
        value={userInfo?.name || ""}
        onChange={(e) =>
          setUserInfo((prev: any) => ({ ...prev, name: e.target.value }))
        }
      />

      <TextField
        fullWidth
        label="Số điện thoại"
        type="tel"
        inputProps={{ maxLength: 10, pattern: "[0-9]*" }}
        value={userInfo?.phone || ""}
        onChange={(e) =>
          setUserInfo((prev: any) => ({ ...prev, phone: e.target.value }))
        }
      />

      <TextField
        fullWidth
        label="Địa chỉ"
        value={userInfo?.address || ""}
        onChange={(e) =>
          setUserInfo((prev: any) => ({ ...prev, address: e.target.value }))
        }
      />

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
              setUserInfo((prev: any) => ({ ...prev, avatarUrl: reader.result }));
            };
            reader.readAsDataURL(file);
          }}
          className="file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            text-sm text-gray-600"
        />
      </div>

      {userInfo?.avatarUrl && (
        <div className="flex justify-center">
          <img
            src={userInfo.avatarUrl}
            alt="Avatar Preview"
            className="w-20 h-20 rounded-full object-cover border border-gray-300 shadow-sm"
          />
        </div>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpdateProfile}
        disabled={profileLoading}
        fullWidth
        className="!mt-2 !bg-green-600 hover:!bg-green-500 transition-all"
      >
        {profileLoading ? "Đang cập nhật..." : "Cập nhật"}
      </Button>
    </div>
  </Box>
</Modal>


    </>
  );
};

export default Navbar;
