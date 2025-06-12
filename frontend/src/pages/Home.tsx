import { useEffect } from "react";
import jwtDecode from "jwt-decode";
import MainBanner from "../components/MainBanner";
import Categoris from "../components/Categoris";
import BestSeller from "../components/BestSeller";
import BottomBanner from "../components/BottomBanner";


const Home = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      const decoded = jwtDecode(token);
      localStorage.setItem("user_info", JSON.stringify(decoded));

      // Phát event để navbar và các tab khác biết đã login
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("authChanged"));

      // Xóa token trong URL để tránh lặp lại xử lý
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="mt-10">
      <MainBanner />
      <Categoris />
      <BestSeller />
      <BottomBanner />
    </div>
  );
};

export default Home;
