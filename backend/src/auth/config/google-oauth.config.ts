import { registerAs } from "@nestjs/config";

// Đăng ký cấu hình Google OAuth
export default registerAs('googleOAuth', () => ({
  clientID: process.env.GOOGLE_CLIENT_ID,        // Lấy clientID từ biến môi trường
  clientSecret: process.env.GOOGLE_SECRET,       // Lấy clientSecret từ biến môi trường
  callbackURL: process.env.GOOGLE_CALLBACK_URL,  // Lấy callbackURL từ biến môi trường
}));
