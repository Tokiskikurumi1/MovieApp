import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import crypto from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import cloudinary from '../config/cloudinary';
import { sendOtpEmail } from '../services/emailService';
import { OtpService } from '../services/otpService';

const JWT_SECRET = process.env.JWT_SECRET || 'cinestream_super_secret_jwt_key_2026';

export async function register(req: Request, res: Response) {
  try {
    const { fullName, phone, email, password } = req.body;

    if (!fullName || !password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ họ tên, mật khẩu và email hoặc số điện thoại',
      });
    }

    // 1. Kiểm tra xem Email đã tồn tại chưa
    if (email && email.trim()) {
      const [existingEmail] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1',
        [email.trim().toLowerCase()]
      );
      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          field: 'email',
          message: 'Email này đã được đăng ký tài khoản. Vui lòng sử dụng email khác hoặc đăng nhập!',
        });
      }
    }

    // 2. Kiểm tra xem Số điện thoại đã tồn tại chưa
    if (phone && phone.trim()) {
      const [existingPhone] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE phone = ? LIMIT 1',
        [phone.trim()]
      );
      if (existingPhone.length > 0) {
        return res.status(400).json({
          success: false,
          field: 'phone',
          message: 'Số điện thoại này đã được đăng ký tài khoản. Vui lòng sử dụng số khác!',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (full_name, email, phone, password_hash, role, vip_tier, status)
       VALUES (?, ?, ?, ?, 'user', 'Free', 'active')`,
      [fullName.trim(), email ? email.trim().toLowerCase() : null, phone ? phone.trim() : null, passwordHash]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { id: userId, email: email || phone, role: 'user', vip_tier: 'Free' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: {
        token,
        user: {
          id: userId,
          fullName,
          email,
          phone,
          role: 'user',
          vipTier: 'Free',
          avatar: 'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_avatar.png',
        },
      },
    });
  } catch (error: any) {
    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { account, password } = req.body;

    if (!account || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tài khoản (email hoặc SĐT) và mật khẩu',
      });
    }

    const trimmed = account.trim().toLowerCase();

    // Tìm kiếm bằng email hoặc số điện thoại
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE LOWER(email) = ? OR phone = ? LIMIT 1',
      [trimmed, account.trim()]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác',
      });
    }

    const user = rows[0];

    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ CINESTREAM.',
      });
    }

    // Kiểm tra mật khẩu (hỗ trợ cả bcrypt hash lẫn mật khẩu test mặc định)
    let isMatch = false;
    if (user.password_hash === password) {
      isMatch = true; // Cho mật khẩu test mặc định như Kurumi1234@, admin123
    } else {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác',
      });
    }

    // Cập nhật last_active
    await pool.query('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email || user.phone, role: user.role, vip_tier: user.vip_tier },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          vipTier: user.vip_tier,
          avatar: user.avatar,
          totalWatchedHours: user.total_watched_hours,
        },
      },
    });
  } catch (error: any) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Đăng nhập bằng Google OAuth
export async function googleLogin(req: Request, res: Response) {
  try {
    const { idToken, accessToken, user: clientUser } = req.body;

    if (!idToken && !accessToken && !clientUser?.email) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin xác thực Google (idToken hoặc accessToken)',
      });
    }

    let email = clientUser?.email || '';
    let name = clientUser?.name || '';
    let picture = clientUser?.photo || clientUser?.picture || '';

    // 1. Xác thực và lấy thông tin từ Google API nếu có accessToken
    if (accessToken) {
      try {
        const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 8000,
        });
        if (googleRes.data && googleRes.data.email) {
          email = googleRes.data.email;
          name = googleRes.data.name || name;
          picture = googleRes.data.picture || picture;
        }
      } catch (gErr: any) {
        console.warn('Lỗi lấy thông tin Google qua accessToken:', gErr.message);
      }
    }

    // 2. Xác thực và lấy thông tin từ Google API nếu có idToken
    if (!email && idToken) {
      try {
        const tokenRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, {
          timeout: 8000,
        });
        if (tokenRes.data && tokenRes.data.email) {
          email = tokenRes.data.email;
          name = tokenRes.data.name || name;
          picture = tokenRes.data.picture || picture;
        }
      } catch (tErr: any) {
        console.warn('Lỗi xác thực idToken Google:', tErr.message);
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xác thực danh tính với Google. Vui lòng thử lại.',
      });
    }

    email = email.trim().toLowerCase();

    // 3. Tìm kiếm người dùng trong Database
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email, phone, avatar, role, vip_tier, total_watched_hours, status FROM users WHERE LOWER(email) = ? LIMIT 1',
      [email]
    );

    let dbUser: any;
    const defaultAvatar = 'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_avatar.png';

    if (rows.length > 0) {
      dbUser = rows[0];
      if (dbUser.status === 'banned') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ CINESTREAM.',
        });
      }

      // Tự động cập nhật avatar từ Google nếu người dùng chưa có hoặc đang dùng avatar mặc định
      const currentAvatar = dbUser.avatar || '';
      const isDefault = !currentAvatar || currentAvatar.includes('default_avatar.png') || currentAvatar.includes('photo-1535713875002');
      if (picture && isDefault) {
        await pool.query('UPDATE users SET avatar = ?, last_active = CURRENT_TIMESTAMP WHERE id = ?', [picture, dbUser.id]);
        dbUser.avatar = picture;
      } else {
        await pool.query('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?', [dbUser.id]);
      }
    } else {
      // 4. Tạo tài khoản mới cho người dùng Google
      const finalAvatar = picture || defaultAvatar;
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const fullName = name.trim() || email.split('@')[0];

      const [insertRes]: any = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, avatar, role, vip_tier, total_watched_hours, status)
         VALUES (?, ?, ?, ?, 'user', 'Free', 0, 'active')`,
        [fullName, email, passwordHash, finalAvatar]
      );

      dbUser = {
        id: insertRes.insertId,
        full_name: fullName,
        email,
        phone: null,
        avatar: finalAvatar,
        role: 'user',
        vip_tier: 'Free',
        total_watched_hours: 0,
      };
    }

    // 5. Ký JWT token
    const token = jwt.sign(
      { id: dbUser.id, email: dbUser.email, role: dbUser.role, vip_tier: dbUser.vip_tier },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Đăng nhập Google thành công!',
      data: {
        token,
        user: {
          id: dbUser.id,
          fullName: dbUser.full_name,
          email: dbUser.email,
          phone: dbUser.phone,
          role: dbUser.role,
          vipTier: dbUser.vip_tier,
          avatar: dbUser.avatar,
          totalWatchedHours: dbUser.total_watched_hours || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Lỗi googleLogin:', error);
    return res.status(500).json({ success: false, message: error.message || 'Lỗi xử lý đăng nhập Google' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email, phone, avatar, role, vip_tier, vip_expiry, total_watched_hours, status, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const u = rows[0];
    const isVip = Boolean(u.vip_tier && u.vip_tier !== 'Free');
    return res.json({
      success: true,
      data: {
        id: u.id,
        fullName: u.full_name,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        phoneNumber: u.phone,
        avatar: u.avatar || 'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_avatar.png',
        avatar_url: u.avatar || 'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_avatar.png',
        role: u.role,
        vipTier: u.vip_tier || 'Free',
        vip_tier: u.vip_tier || 'Free',
        is_vip: isVip,
        vipExpiry: u.vip_expiry,
        vip_expires_at: u.vip_expiry,
        totalWatchedHours: u.total_watched_hours || 0,
        status: u.status,
        createdAt: u.created_at,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }

    const fullName = req.body.fullName || req.body.full_name;
    const avatar = req.body.avatar || req.body.avatar_url;
    const phone = req.body.phone || req.body.phoneNumber;

    let finalAvatar = avatar;
    if (avatar && typeof avatar === 'string' && avatar.startsWith('data:image/')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(avatar, {
          folder: 'cinestream_avatars',
          transformation: [
            { width: 350, height: 350, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        });
        finalAvatar = uploadRes.secure_url;
      } catch (cErr) {
        console.warn('Lỗi Cloudinary trong updateProfile:', cErr);
      }
    }

    await pool.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), avatar = COALESCE(?, avatar), phone = COALESCE(?, phone) WHERE id = ?',
      [fullName ?? null, finalAvatar ?? null, phone ?? null, req.user.id]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email, phone, avatar, role, vip_tier, vip_expiry, total_watched_hours, status, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    const u = rows[0];
    const isVip = Boolean(u.vip_tier && u.vip_tier !== 'Free');
    const updatedUser = {
      id: u.id,
      fullName: u.full_name,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      phoneNumber: u.phone,
      avatar: u.avatar,
      avatar_url: u.avatar,
      role: u.role,
      vipTier: u.vip_tier || 'Free',
      vip_tier: u.vip_tier || 'Free',
      is_vip: isVip,
      vipExpiry: u.vip_expiry,
      vip_expires_at: u.vip_expiry,
      totalWatchedHours: u.total_watched_hours || 0,
      status: u.status,
      createdAt: u.created_at,
    };

    return res.json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Tải ảnh đại diện người dùng lên Cloudinary
export async function uploadAvatar(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng' });
    }

    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp dữ liệu hình ảnh' });
    }

    // Tải ảnh lên Cloudinary
    let secureUrl = image;
    try {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'cinestream_avatars',
        transformation: [
          { width: 350, height: 350, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });
      secureUrl = uploadRes.secure_url;
    } catch (cErr: any) {
      console.error('Cloudinary upload error:', cErr);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tải ảnh lên Cloudinary: ' + (cErr.message || 'Kiểm tra lại Cloud Name / API Key'),
      });
    }

    // Cập nhật URL ảnh Cloudinary vào MySQL
    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [secureUrl, req.user.id]);

    return res.json({
      success: true,
      message: 'Tải lên và lưu ảnh đại diện Cloudinary thành công!',
      avatar: secureUrl,
      avatar_url: secureUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        field: 'currentPassword',
        message: 'Vui lòng cung cấp mật khẩu hiện tại',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        field: 'newPassword',
        message: 'Vui lòng cung cấp mật khẩu mới',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        field: 'newPassword',
        message: 'Mật khẩu mới phải có tối thiểu 6 ký tự',
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, password_hash FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const user = rows[0];

    let isPasswordCorrect = false;
    if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
      isPasswordCorrect = await bcrypt.compare(currentPassword, user.password_hash);
    } else {
      isPasswordCorrect = currentPassword === user.password_hash;
    }

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        field: 'currentPassword',
        message: 'Mật khẩu hiện tại không chính xác! Vui lòng kiểm tra lại.',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        field: 'newPassword',
        message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      newPasswordHash,
      req.user.id,
    ]);

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công! Hãy dùng mật khẩu mới cho các lần đăng nhập tiếp theo.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Kiểm tra email hoặc SĐT đã tồn tại chưa (dùng cho đăng ký)
export async function checkExists(req: Request, res: Response) {
  try {
    const { email, phone } = req.body;
    let emailExists = false;
    let phoneExists = false;

    if (email && typeof email === 'string' && email.trim()) {
      const [emailRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1',
        [email.trim().toLowerCase()]
      );
      emailExists = emailRows.length > 0;
    }

    if (phone && typeof phone === 'string' && phone.trim()) {
      const [phoneRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE phone = ? LIMIT 1',
        [phone.trim()]
      );
      phoneExists = phoneRows.length > 0;
    }

    return res.json({
      success: true,
      data: {
        emailExists,
        phoneExists,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Kiểm tra email có tồn tại không (dùng cho Quên mật khẩu)
export async function checkEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email FROM users WHERE LOWER(email) = ? LIMIT 1',
      [email.trim().toLowerCase()]
    );

    const exists = rows.length > 0;

    return res.json({
      success: true,
      exists,
      message: exists
        ? 'Email tồn tại trong hệ thống'
        : 'Email này chưa được đăng ký trong hệ thống!',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Gửi mã OTP 4 số về Gmail để quên mật khẩu
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email hợp lệ' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Kiểm tra xem email có tồn tại trong hệ thống không
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email FROM users WHERE LOWER(email) = ? LIMIT 1',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email này chưa được đăng ký trong hệ thống CINESTREAM!',
      });
    }

    const user = rows[0];

    // Tạo mã OTP 4 số ngẫu nhiên (1000 - 9999)
    const otp = OtpService.generateOtp();
    OtpService.saveOtp(normalizedEmail, otp);

    // Gửi email chứa mã OTP qua Gmail SMTP
    const emailResult = await sendOtpEmail(normalizedEmail, otp, user.full_name);

    return res.json({
      success: true,
      message: emailResult.success
        ? 'Mã xác thực 4 số đã được gửi về Gmail của bạn! Vui lòng kiểm tra hòm thư.'
        : 'Đã tạo mã xác thực thành công (vui lòng kiểm tra console server nếu chưa cấu hình Gmail App Password).',
    });
  } catch (error: any) {
    console.error('Lỗi forgotPassword:', error);
    return res.status(500).json({ success: false, message: error.message || 'Lỗi xử lý quên mật khẩu' });
  }
}

// 8. Xác thực mã OTP 4 chữ số
export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mã OTP' });
    }

    const result = OtpService.verifyOtp(email, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 9. Đặt lại mật khẩu mới (có xác thực OTP)
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ email và mật khẩu mới',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Kiểm tra tính hợp lệ của OTP nếu có gửi lên hoặc đã verify ở bước trước
    if (otp) {
      const verifyRes = OtpService.verifyOtp(normalizedEmail, otp);
      if (!verifyRes.valid) {
        return res.status(400).json({ success: false, message: verifyRes.message });
      }
    } else if (!OtpService.isVerified(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng xác thực mã OTP trước khi đặt lại mật khẩu!',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có từ 8 ký tự trở lên',
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email này không tồn tại trong hệ thống!',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = ? WHERE LOWER(email) = ?', [
      passwordHash,
      normalizedEmail,
    ]);

    // Xóa OTP khỏi bộ nhớ sau khi đổi mật khẩu thành công
    OtpService.clearOtp(normalizedEmail);

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
