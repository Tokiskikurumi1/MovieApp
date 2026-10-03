interface OtpRecord {
  otp: string;
  expiresAt: number;
  verified: boolean;
}

// Lưu trữ mã OTP trong bộ nhớ RAM máy chủ
const otpStore = new Map<string, OtpRecord>();

// Thời hạn hiệu lực: 5 phút
const OTP_EXPIRY_MS = 5 * 60 * 1000;

export const OtpService = {
  /**
   * Tạo ngẫu nhiên mã OTP 4 chữ số (1000 - 9999)
   */
  generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  /**
   * Lưu mã OTP cho email
   */
  saveOtp(email: string, otp: string) {
    const key = email.trim().toLowerCase();
    otpStore.set(key, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      verified: false,
    });
  },

  /**
   * Kiểm tra mã OTP
   */
  verifyOtp(email: string, otp: string): { valid: boolean; message: string } {
    const key = email.trim().toLowerCase();
    const record = otpStore.get(key);

    if (!record) {
      return {
        valid: false,
        message: 'Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.',
      };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return {
        valid: false,
        message: 'Mã OTP đã hết hiệu lực (quá 5 phút). Vui lòng gửi lại mã mới.',
      };
    }

    if (record.otp !== otp.trim()) {
      return {
        valid: false,
        message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.',
      };
    }

    // Đánh dấu đã xác thực thành công bước OTP
    record.verified = true;
    return {
      valid: true,
      message: 'Xác thực OTP thành công!',
    };
  },

  /**
   * Kiểm tra xem email này đã xác thực OTP thành công chưa trước khi cho phép đổi mật khẩu
   */
  isVerified(email: string): boolean {
    const key = email.trim().toLowerCase();
    const record = otpStore.get(key);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return false;
    }
    return record.verified;
  },

  /**
   * Xóa OTP sau khi đã đổi mật khẩu thành công
   */
  clearOtp(email: string) {
    const key = email.trim().toLowerCase();
    otpStore.delete(key);
  },
};
