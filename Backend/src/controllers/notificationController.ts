import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getIO } from '../socket';

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

let isTableEnsured = false;
async function ensureNotificationTable() {
  if (isTableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        movie_id INT NULL,
        movie_slug VARCHAR(255) NULL,
        image VARCHAR(500) NULL,
        target_audience VARCHAR(50) DEFAULT 'all',
        action_route VARCHAR(255) DEFAULT '/(tabs)',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_count INT DEFAULT 0,
        total_sent INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [nCols] = await pool.query<any[]>("SHOW COLUMNS FROM notifications");
    const existingColNames = nCols.map((c: any) => c.Field);

    if (!existingColNames.includes('movie_id')) {
      await pool.query("ALTER TABLE notifications ADD COLUMN movie_id INT NULL AFTER type");
    }
    if (!existingColNames.includes('movie_slug')) {
      await pool.query("ALTER TABLE notifications ADD COLUMN movie_slug VARCHAR(255) NULL AFTER movie_id");
    }
    if (!existingColNames.includes('image')) {
      await pool.query("ALTER TABLE notifications ADD COLUMN image VARCHAR(500) NULL AFTER movie_slug");
    }
    if (!existingColNames.includes('target_audience')) {
      await pool.query("ALTER TABLE notifications ADD COLUMN target_audience VARCHAR(50) DEFAULT 'all' AFTER image");
    }
    if (!existingColNames.includes('action_route')) {
      await pool.query("ALTER TABLE notifications ADD COLUMN action_route VARCHAR(255) DEFAULT '/(tabs)' AFTER target_audience");
    }
    if (!existingColNames.includes('sent_at')) {
      await pool.query("ALTER TABLE notifications ADD COLUMN sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER action_route");
    }
    if (!existingColNames.includes('read_count')) {
      await pool.query("ALTER TABLE notifications ADD COLUMN read_count INT DEFAULT 0 AFTER sent_at");
    }
    if (!existingColNames.includes('total_sent')) {
      await pool.query("ALTER TABLE notifications ADD COLUMN total_sent INT DEFAULT 0 AFTER read_count");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_notification_reads (
        user_id INT NOT NULL,
        notification_id INT NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, notification_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    isTableEnsured = true;
  } catch (err) {
    console.warn('Lỗi ensureNotificationTable:', err);
  }
}

// ============================================================================
// 1. MOBILE / USER NOTIFICATION CONTROLLERS
// ============================================================================

export async function getUserNotifications(req: AuthRequest, res: Response) {
  try {
    await ensureNotificationTable();
    const userId = req.user?.id || 0;
    const isVip = req.user?.vip_tier && req.user.vip_tier !== 'free' ? 1 : 0;

    const query = `
      SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.movie_id,
        n.movie_slug,
        COALESCE(n.image, m.poster_url, m.thumb_url) AS image,
        n.target_audience,
        n.action_route,
        n.sent_at,
        CASE WHEN unr.read_at IS NOT NULL THEN 1 ELSE 0 END AS is_read
      FROM notifications n
      LEFT JOIN movies m ON n.movie_id = m.id
      LEFT JOIN user_notification_reads unr ON unr.notification_id = n.id AND unr.user_id = ?
      WHERE n.target_audience = 'all' 
         OR (n.target_audience = 'vip' AND ? = 1)
         OR (n.target_audience = 'free' AND ? = 0)
      ORDER BY n.sent_at DESC
      LIMIT 50
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [userId, isVip, isVip]);

    const notifications = rows.map((row) => ({
      id: `notif-${row.id}`,
      dbId: row.id,
      type: row.type || 'system',
      title: row.title,
      message: row.message,
      time: formatTimeAgo(row.sent_at),
      isRead: Boolean(row.is_read),
      image: row.image || undefined,
      movieId: row.movie_id || undefined,
      movieSlug: row.movie_slug || undefined,
      actionRoute: row.action_route || (row.movie_slug ? `/movie/${row.movie_slug}` : '/(tabs)'),
      sentAt: row.sent_at,
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error: any) {
    console.error('Lỗi getUserNotifications:', error);
    return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách thông báo' });
  }
}

export async function markNotificationAsRead(req: AuthRequest, res: Response) {
  try {
    const idParam = req.params.id;
    const notificationId = Number(String(idParam).replace('notif-', ''));
    if (!notificationId || isNaN(notificationId)) {
      return res.status(400).json({ success: false, message: 'Mã thông báo không hợp lệ' });
    }

    const userId = req.user?.id || 0;
    if (userId) {
      await pool.query(
        `INSERT IGNORE INTO user_notification_reads (user_id, notification_id) VALUES (?, ?)`,
        [userId, notificationId]
      );
    }

    await pool.query(
      `UPDATE notifications SET read_count = read_count + 1 WHERE id = ?`,
      [notificationId]
    );

    return res.json({
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc',
    });
  } catch (error: any) {
    console.error('Lỗi markNotificationAsRead:', error);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật thông báo' });
  }
}

export async function markAllNotificationsAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 0;
    if (userId) {
      await pool.query(
        `INSERT IGNORE INTO user_notification_reads (user_id, notification_id)
         SELECT ?, id FROM notifications`,
        [userId]
      );
    }

    return res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    });
  } catch (error: any) {
    console.error('Lỗi markAllNotificationsAsRead:', error);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật tất cả thông báo' });
  }
}

// ============================================================================
// 2. ADMIN NOTIFICATION CONTROLLERS
// ============================================================================

export async function getAdminNotifications(req: Request, res: Response) {
  try {
    await ensureNotificationTable();
    const query = `
      SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.movie_id,
        n.movie_slug,
        COALESCE(n.image, m.poster_url, m.thumb_url) AS image,
        n.target_audience,
        n.action_route,
        n.sent_at,
        n.read_count,
        n.total_sent,
        m.name AS movie_name
      FROM notifications n
      LEFT JOIN movies m ON n.movie_id = m.id
      ORDER BY n.sent_at DESC
      LIMIT 100
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query);

    const data = rows.map((row) => ({
      id: `notif-${row.id}`,
      dbId: row.id,
      title: row.title,
      message: row.message,
      type: row.type,
      movieId: row.movie_id,
      movieSlug: row.movie_slug,
      movieName: row.movie_name,
      image: row.image,
      targetAudience: row.target_audience,
      actionRoute: row.action_route,
      sentAt: new Date(row.sent_at).toLocaleString('vi-VN'),
      readCount: row.read_count || 0,
      totalSent: row.total_sent || 0,
    }));

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Lỗi getAdminNotifications:', error);
    return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách thông báo quản trị' });
  }
}

export async function createAdminNotification(req: Request, res: Response) {
  try {
    await ensureNotificationTable();
    const {
      title,
      message,
      type = 'movie',
      movieId,
      movieSlug,
      image,
      targetAudience = 'all',
      actionRoute,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung là bắt buộc' });
    }

    // Đảm bảo bảng notifications luôn tồn tại
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        movie_id INT NULL,
        movie_slug VARCHAR(255) NULL,
        image VARCHAR(500) NULL,
        target_audience VARCHAR(50) DEFAULT 'all',
        action_route VARCHAR(255) DEFAULT '/(tabs)',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_count INT DEFAULT 0,
        total_sent INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    let finalMovieId = movieId ? Number(movieId) : null;
    let finalMovieSlug = movieSlug || null;
    let finalImage = image || null;
    let finalActionRoute = actionRoute || '/(tabs)';

    // Nếu có movieId, lấy thông tin phim chuẩn từ DB
    if (finalMovieId) {
      try {
        const [movies] = await pool.query<RowDataPacket[]>(
          'SELECT id, name, slug, poster_url, thumb_url FROM movies WHERE id = ? LIMIT 1',
          [finalMovieId]
        );
        if (movies.length > 0) {
          const movie = movies[0];
          finalMovieSlug = finalMovieSlug || movie.slug;
          finalImage = finalImage || movie.poster_url || movie.thumb_url;
          if (!actionRoute) {
            finalActionRoute = `/movie/${movie.slug}`;
          }
        }
      } catch (movieErr) {
        console.warn('Lỗi truy vấn thông tin phim cho notification:', movieErr);
      }
    }

    // Đếm số lượng user nhận được
    let totalSent = 0;
    try {
      let userCountQuery = 'SELECT COUNT(*) as count FROM users';
      if (targetAudience === 'vip') {
        userCountQuery += " WHERE LOWER(vip_tier) NOT IN ('free', 'none') AND vip_tier IS NOT NULL";
      } else if (targetAudience === 'free') {
        userCountQuery += " WHERE LOWER(vip_tier) = 'free' OR vip_tier IS NULL";
      }

      const [countRows] = await pool.query<RowDataPacket[]>(userCountQuery);
      totalSent = countRows[0]?.count || 0;
    } catch (_) {
      totalSent = 1;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO notifications 
        (title, message, type, movie_id, movie_slug, image, target_audience, action_route, total_sent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        message.trim(),
        type,
        finalMovieId,
        finalMovieSlug,
        finalImage,
        targetAudience,
        finalActionRoute,
        totalSent,
      ]
    );

    const insertedId = result.insertId;

    const newNotification = {
      id: `notif-${insertedId}`,
      dbId: insertedId,
      title: title.trim(),
      message: message.trim(),
      type,
      movieId: finalMovieId,
      movieSlug: finalMovieSlug,
      image: finalImage,
      targetAudience,
      actionRoute: finalActionRoute,
      sentAt: new Date().toLocaleString('vi-VN'),
      time: 'Vừa xong',
      isRead: false,
      readCount: 0,
      totalSent,
    };

    // Gửi realtime qua Socket.io đến các máy khách
    try {
      const io = getIO();
      if (io) {
        io.emit('new_notification', newNotification);
      }
    } catch (socketErr) {
      console.warn('Socket emit notification warning:', socketErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Tạo và bắn thông báo thành công',
      data: newNotification,
    });
  } catch (error: any) {
    console.error('Lỗi createAdminNotification:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Lỗi tạo thông báo quản trị',
    });
  }
}

export async function deleteAdminNotification(req: Request, res: Response) {
  try {
    const idParam = req.params.id;
    const notificationId = Number(String(idParam).replace('notif-', ''));

    if (!notificationId || isNaN(notificationId)) {
      return res.status(400).json({ success: false, message: 'Mã thông báo không hợp lệ' });
    }

    await pool.query('DELETE FROM notifications WHERE id = ?', [notificationId]);

    return res.json({
      success: true,
      message: 'Đã xóa thông báo thành công',
    });
  } catch (error: any) {
    console.error('Lỗi deleteAdminNotification:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xóa thông báo' });
  }
}
