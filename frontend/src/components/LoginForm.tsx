import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import "react-toastify/dist/ReactToastify.css";
import { UserType } from "../types";

interface DecodedToken {
  sub: string;
  role: string;
  name?: string;
  email: string;
  address?: string;
  phone?: string;
  isGoogleAccount?: boolean;
  avatarUrl?: string;
}

interface LoginResponse {
  access_token: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { setUser } = useAppContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      try {
        localStorage.setItem("accessToken", token);
        const decoded = jwtDecode<DecodedToken>(token);

        const userInfo: UserType = {
          _id: decoded.sub,
          name: decoded.name ?? "",
          email: decoded.email,
          password: "",
          phone: decoded.phone ?? "",
          address: decoded.address ?? "",
          role: decoded.role as "customer" | "supplier" | "admin",
        };

        localStorage.setItem("user_info", JSON.stringify(userInfo));
        setUser(userInfo);

        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("authChanged"));
        window.history.replaceState({}, "", window.location.pathname);

        if (userInfo.role === "admin") {
          navigate("/admin");
        } else if (userInfo.role === "supplier") {
          navigate("/seller");
        } else {
          navigate("/");
        }

        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("❌ Lỗi giải mã token:", err);
        toast.error("Token không hợp lệ");
      }
    }
  }, [navigate, onSuccess, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:5000/auth/login",
        { email, password }
      );

      const token = response.data.access_token;
      localStorage.setItem("accessToken", token);

      const decoded = jwtDecode<DecodedToken>(token);

      const userInfo: UserType = {
        _id: decoded.sub,
        name: decoded.name ?? "",
        email: decoded.email,
        password: "",
        phone: decoded.phone ?? "",
        address: decoded.address ?? "",
        role: decoded.role as "customer" | "supplier" | "admin",
      };

      localStorage.setItem("user_info", JSON.stringify(userInfo));
      setUser(userInfo);

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("authChanged"));

      if (userInfo.role === "admin") {
        navigate("/admin");
      } else if (userInfo.role === "supplier") {
        navigate("/seller");
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        toast.error(msg || "Đăng nhập thất bại. Vui lòng thử lại.");
      } else {
        console.error("❌ Lỗi không xác định khi đăng nhập:", err);
        toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google/login";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white text-gray-500 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-lg shadow-[0px_0px_10px_0px] shadow-black/10">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-9 text-center text-gray-800">
            Đăng nhập
          </h2>

          <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
            <input
              className="w-full outline-none bg-transparent py-2.5"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center mt-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
            <input
              className="w-full outline-none bg-transparent py-2.5"
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-right mb-4 mt-2">
            <a href="/forgot-password" className="text-sm text-green-600 hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mb-3 bg-green-600 hover:bg-green-500 transition-all active:scale-95 py-2.5 rounded text-white font-medium ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

           <div className="text-center mb-4 mt-2">
            <p>Bạn chưa có tài khoản ?<a href="/sign" className="text-sm text-green-600 ">
              Bấm vào đây
            </a></p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mb-3 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all active:scale-95 py-2.5 rounded font-medium flex items-center justify-center gap-2"
          >
            <img className="h-4 w-4" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleFavicon.png" alt="googleFavicon" />
            Đăng nhập với Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
