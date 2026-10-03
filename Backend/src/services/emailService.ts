import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Khởi tạo Transporter cho Gmail SMTP
function createTransporter() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
  const user = process.env.EMAIL_USER?.trim() || '';
  const pass = process.env.EMAIL_PASS?.trim() || '';

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Gửi email chứa mã OTP 4 số đặt lại mật khẩu
 * @param toEmail Địa chỉ email người nhận
 * @param otp Mã xác thực 4 chữ số
 * @param fullName Tên người dùng (nếu có)
 */
export async function sendOtpEmail(toEmail: string, otp: string, fullName?: string): Promise<{ success: boolean; message: string }> {
  const userName = fullName?.trim() || 'Quý khách';
  const transporter = createTransporter();

  // Template HTML giao diện phong cách Cinema bóng bẩy
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Mã xác thực đặt lại mật khẩu CINESTREAM</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #08090E;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #FFFFFF;
      }
      .container {
        max-width: 560px;
        margin: 30px auto;
        background-color: #10121D;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
      }
      .header {
        background: linear-gradient(135deg, #E50914 0%, #B81D24 100%);
        padding: 28px 24px;
        text-align: center;
      }
      .logo {
        font-size: 26px;
        font-weight: 900;
        letter-spacing: 2px;
        color: #FFFFFF;
        text-transform: uppercase;
        margin: 0;
      }
      .tagline {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.85);
        margin-top: 4px;
        letter-spacing: 1px;
      }
      .content {
        padding: 32px 28px;
        background-color: #10121D;
      }
      .greeting {
        font-size: 18px;
        font-weight: 700;
        color: #FFFFFF;
        margin-bottom: 14px;
      }
      .desc {
        font-size: 14px;
        line-height: 1.6;
        color: #A0A5B8;
        margin-bottom: 24px;
      }
      .otp-card {
        background: #181B2A;
        border: 2px dashed #E50914;
        border-radius: 12px;
        padding: 24px 16px;
        text-align: center;
        margin-bottom: 24px;
      }
      .otp-title {
        font-size: 12px;
        text-transform: uppercase;
        color: #8E94A8;
        letter-spacing: 1.5px;
        margin-bottom: 8px;
      }
      .otp-code {
        font-size: 38px;
        font-weight: 900;
        letter-spacing: 12px;
        color: #E50914;
        text-shadow: 0 0 16px rgba(229, 9, 20, 0.4);
        margin: 0;
        font-family: 'SF Mono', Monaco, Consolas, monospace;
      }
      .expiry-badge {
        display: inline-block;
        margin-top: 10px;
        font-size: 12px;
        color: #FFB800;
        background-color: rgba(255, 184, 0, 0.12);
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 600;
      }
      .warning-box {
        background-color: rgba(255, 255, 255, 0.03);
        border-left: 3px solid #E50914;
        padding: 12px 16px;
        border-radius: 4px;
        margin-bottom: 24px;
      }
      .warning-text {
        font-size: 12px;
        color: #8E94A8;
        margin: 0;
        line-height: 1.5;
      }
      .footer {
        padding: 20px 24px;
        text-align: center;
        background-color: #0A0C14;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      .footer-text {
        font-size: 11px;
        color: #555A6E;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="logo">CINESTREAM</h1>
        <div class="tagline">PREMIUM CINEMA STREAMING</div>
      </div>
      <div class="content">
        <div class="greeting">Xin chào ${userName},</div>
        <div class="desc">
          Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản CINESTREAM liên kết với email <strong style="color: #FFFFFF;">${toEmail}</strong>.<br>
          Dưới đây là mã xác thực 4 chữ số (OTP) của bạn:
        </div>
        <div class="otp-card">
          <div class="otp-title">Mã xác thực của bạn</div>
          <div class="otp-code">${otp}</div>
          <div class="expiry-badge">⏱ Hiệu lực trong 5 phút</div>
        </div>
        <div class="warning-box">
          <p class="warning-text">
            ⚠️ <strong>Bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ của CINESTREAM. Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email hoặc liên hệ với chúng tôi để bảo vệ tài khoản.
          </p>
        </div>
      </div>
      <div class="footer">
        <p class="footer-text">© ${new Date().getFullYear()} CINESTREAM Platform. Mọi quyền được bảo lưu.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  // Luôn ghi log ra màn hình console terminal của server để phục vụ test nhanh
  console.log(`\n======================================================`);
  console.log(`🔔 [CINESTREAM OTP SERVICE]`);
  console.log(`   Email nhận : ${toEmail}`);
  console.log(`   Mã OTP 4 số: 👉 [ ${otp} ] 👈`);
  console.log(`   Thời hạn   : 5 phút`);
  console.log(`======================================================\n`);

  if (!transporter) {
    console.warn(
      '⚠️ [EMAIL SERVICE] Chưa cấu hình EMAIL_USER và EMAIL_PASS trong Backend/.env. ' +
      'Mã OTP đã được in ra console terminal để phục vụ kiểm thử.'
    );
    return {
      success: true,
      message: 'Mã xác thực đã được tạo (Xem log terminal nếu chưa cấu hình Gmail App Password).',
    };
  }

  try {
    const sender = process.env.EMAIL_USER?.trim();
    await transporter.sendMail({
      from: `"CINESTREAM Support" <${sender}>`,
      to: toEmail,
      subject: `[CINESTREAM] ${otp} là mã xác thực đặt lại mật khẩu của bạn`,
      html: htmlContent,
      text: `Xin chào ${userName},\nMã xác thực đặt lại mật khẩu CINESTREAM của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã cho bất kỳ ai.`,
    });

    console.log(`✅ [EMAIL SERVICE] Đã gửi email thành công đến ${toEmail}`);
    return {
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn!',
    };
  } catch (error: any) {
    console.error('❌ [EMAIL SERVICE] Lỗi gửi email qua Gmail SMTP:', error.message);
    return {
      success: false,
      message: 'Không thể gửi email: ' + (error.message || 'Lỗi kết nối SMTP'),
    };
  }
}
