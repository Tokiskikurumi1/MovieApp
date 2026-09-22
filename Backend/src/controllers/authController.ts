import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

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
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
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
    return res.json({
      success: true,
      data: {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        vipTier: u.vip_tier,
        vipExpiry: u.vip_expiry,
        totalWatchedHours: u.total_watched_hours,
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

    const { fullName, avatar, phone } = req.body;
    await pool.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), avatar = COALESCE(?, avatar), phone = COALESCE(?, phone) WHERE id = ?',
      [fullName, avatar, phone, req.user.id]
    );

    return res.json({ success: true, message: 'Cập nhật thông tin thành công!' });
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

// 7. Đặt lại mật khẩu mới
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ email và mật khẩu mới',
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
      [email.trim().toLowerCase()]
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
      email.trim().toLowerCase(),
    ]);

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
