import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,        // Tài khoản Gmail (ví dụ: yourapp@gmail.com)
      pass: process.env.GMAIL_PASS,        // Mật khẩu ứng dụng (không phải mật khẩu Gmail thường)
    },
  });

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Nông sản Trà Vinh" <${process.env.GMAIL_USER}>`,
      to,
      subject: '📩 Xác minh tài khoản của bạn',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Chào mừng bạn đến với Nông sản Trà Vinh! 👋</h2>
          <p>Vui lòng xác minh tài khoản của bạn bằng cách nhấn vào liên kết dưới đây:</p>
          <a href="${verificationLink}" target="_blank" style="display:inline-block;margin-top:10px;padding:10px 15px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Xác minh tài khoản</a>
          <p>Liên kết sẽ hết hạn sau 24 giờ.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
  const url = `http://localhost:5173/reset-password?token=${token}`;

  await this.transporter.sendMail({
    from: `"Nông sản Trà Vinh" <${process.env.GMAIL_USER}>`,
    to,
    subject: '🔐 Đặt lại mật khẩu',
    html: `
      <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới để tiếp tục:</p>
      <a href="${url}" target="_blank">${url}</a>
      <p>Link sẽ hết hạn sau 15 phút.</p>
    `,
  });
}
}
