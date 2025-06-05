import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";
import { AppContextType, UserType } from "../types";
import jwtDecode from "jwt-decode";

interface AppContextProviderProps {
  children: ReactNode;
}

interface DecodedToken {
  sub: string;
  role: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isSeller, setIsSeller] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      window.history.replaceState({}, document.title, "/");

      try {
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
      } catch (err) {
        console.error("Không thể giải mã token:", err);
      }
    } else {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user_info");
      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as UserType;
          setUser(parsed);
        } catch (err) {
          console.error("Lỗi khi parse user_info từ localStorage:", err);
        }
      }
    }
  }, []);

  // (Tuỳ chọn) Đồng bộ nếu context bị mất
  useEffect(() => {
    const syncUser = () => {
      const userStr = localStorage.getItem("user_info");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    };
    window.addEventListener("authChanged", syncUser);
    return () => window.removeEventListener("authChanged", syncUser);
  }, []);


  const value: AppContextType = { navigate, user, setUser, isSeller, setIsSeller };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
