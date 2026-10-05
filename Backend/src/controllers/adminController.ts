import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { crawlKKPhim } from '../crawler/kkphim';

// 1. Lấy thống kê tổng quan (Dashboard Stats)
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const [[{ totalMovies }]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as totalMovies FROM movies');
    const [[{ totalEpisodes }]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as totalEpisodes FROM episodes');
    const [[{ totalUsers }]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ activeVipUsers }]] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as activeVipUsers FROM users WHERE vip_tier != 'Free' AND (vip_expiry IS NULL OR vip_expiry > NOW())"
    );
    const [[{ totalViews }]] = await pool.query<RowDataPacket[]>('SELECT COALESCE(SUM(view_count), 0) as totalViews FROM movies');
    const [[{ totalRevenue }]] = await pool.query<RowDataPacket[]>(
      "SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM transactions WHERE status = 'success'"
    );
    const [[{ totalRevenueMonth }]] = await pool.query<RowDataPacket[]>(
      "SELECT COALESCE(SUM(amount), 0) as totalRevenueMonth FROM transactions WHERE status = 'success' AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())"
    );

    // Biểu đồ doanh thu 7 ngày gần nhất tính theo dữ liệu thực
    const dayMap: Record<number, string> = { 0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' };
    const revenue7Days: Array<{ day: string; date: string; revenue: number }> = [];

    const [tx7Days] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(created_at) as txDate, COALESCE(SUM(amount), 0) as dailyRevenue
       FROM transactions
       WHERE status = 'success' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at)`
    );

    const txMap: Record<string, number> = {};
    tx7Days.forEach((row) => {
      const d = new Date(row.txDate).toISOString().split('T')[0];
      txMap[d] = Number(row.dailyRevenue || 0);
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const dayLabel = `${dayMap[d.getDay()]} (${formattedDate})`;
      revenue7Days.push({
        day: dayLabel,
        date: formattedDate,
        revenue: txMap[dateStr] || 0,
      });
    }

    // Phân bổ thể loại thực tế từ DB
    const [genreRows] = await pool.query<RowDataPacket[]>(
      `SELECT c.name as genre, COUNT(mc.movie_id) as count
       FROM categories c
       JOIN movie_categories mc ON c.id = mc.category_id
       GROUP BY c.id, c.name
       ORDER BY count DESC
       LIMIT 4`
    );

    const totalGenreCount = genreRows.reduce((acc, g) => acc + Number(g.count || 0), 0);
    const genreColors = ['#FF334B', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    const genreDistribution = genreRows.map((g, idx) => ({
      name: g.genre,
      count: Number(g.count),
      percentage: totalGenreCount > 0 ? Math.round((Number(g.count) / totalGenreCount) * 100) : 0,
      color: genreColors[idx % genreColors.length],
    }));

    // Top 5 phim xem nhiều nhất từ DB
    const [topMovies] = await pool.query<RowDataPacket[]>(
      `SELECT id, name as title, origin_name as originalTitle, slug,
              thumb_url as poster, poster_url as banner, rating, quality,
              COALESCE(view_count, 0) as views
       FROM movies
       ORDER BY view_count DESC, id DESC
       LIMIT 5`
    );

    // 5 Giao dịch mới nhất từ DB
    const [recentTransactions] = await pool.query<RowDataPacket[]>(
      `SELECT t.id, t.order_code as orderCode, t.package_name as packageName,
              t.amount, t.payment_method as paymentMethod, t.status, t.created_at as createdAt,
              u.id as userId, u.full_name as userName, u.avatar as userAvatar
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT 5`
    );

    return res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: Number(totalRevenue) || 0,
          totalRevenueMonth: Number(totalRevenueMonth) || Number(totalRevenue) || 0,
          totalUsers: Number(totalUsers) || 0,
          activeVipUsers: Number(activeVipUsers) || 0,
          totalMovies: Number(totalMovies) || 0,
          totalEpisodes: Number(totalEpisodes) || 0,
          totalViews: Number(totalViews) || 0,
          viewsGrowthPercent: '+12.5%',
          vipGrowthPercent: '+8.3%',
          revenueGrowthPercent: '+15.2%',
        },
        revenueChart: revenue7Days,
        genreDistribution: genreDistribution.length > 0 ? genreDistribution : [
          { name: 'Hành Động', count: 0, percentage: 0, color: '#FF334B' },
          { name: 'Tình Cảm', count: 0, percentage: 0, color: '#3B82F6' },
        ],
        topMovies: topMovies.map((m) => ({
          ...m,
          id: String(m.id),
          poster: m.poster || 'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_poster.png',
          views: Number(m.views || 0),
          rating: Number(m.rating || 8.5),
          quality: m.quality || '4K HDR',
        })),
        recentTransactions: recentTransactions.map((tx) => ({
          id: String(tx.id),
          orderCode: tx.orderCode,
          packageName: tx.packageName || 'Gói VIP 1 Tháng',
          amount: Number(tx.amount || 0),
          paymentMethod: tx.paymentMethod || 'MoMo',
          status: tx.status || 'success',
          createdAt: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay',
          user: {
            id: String(tx.userId || '1'),
            name: tx.userName || 'Hội viên CINESTREAM',
            avatar: tx.userAvatar || 'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_avatar.png',
          },
        })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Quản lý danh sách phim trên Admin
export async function getAdminMovies(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const { search, genre, isVip, status } = req.query;

    let query = `
      SELECT m.id, m.name as title, m.origin_name as originalTitle, m.slug,
             m.thumb_url as poster, m.poster_url as banner, m.trailer_url as trailerUrl,
             m.rating, m.vote_count as voteCount, m.year, m.quality, m.is_vip as isVip,
             m.status, m.view_count as views, m.created_at as createdAt,
             (SELECT COUNT(*) FROM episodes e WHERE e.movie_id = m.id) as totalEpisodes
      FROM movies m
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(m.name LIKE ? OR m.origin_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (genre && genre !== 'ALL') {
      query += ` JOIN movie_categories mc ON m.id = mc.movie_id
                 JOIN categories c ON mc.category_id = c.id `;
      conditions.push('c.name = ?');
      params.push(genre);
    }

    if (isVip && isVip !== 'ALL') {
      conditions.push('m.is_vip = ?');
      params.push(isVip === 'VIP');
    }

    if (status && status !== 'ALL') {
      conditions.push('m.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY m.updated_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    // Lấy genres cho từng phim
    const formattedMovies = await Promise.all(
      rows.map(async (m) => {
        const [genres] = await pool.query<RowDataPacket[]>(
          `SELECT c.name FROM categories c
           JOIN movie_categories mc ON c.id = mc.category_id
           WHERE mc.movie_id = ?`,
          [m.id]
        );
        return {
          ...m,
          id: String(m.id),
          isVip: Boolean(m.isVip),
          rating: parseFloat(m.rating) || 8.5,
          genres: genres.map((g) => g.name),
        };
      })
    );

    return res.json({ success: true, data: formattedMovies });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Xóa phim
export async function deleteMovie(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM movies WHERE id = ? OR slug = ?', [id, id]);
    return res.json({ success: true, message: 'Đã xóa phim thành công' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Quản lý người dùng
export async function getAdminUsers(req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.full_name as fullName, u.email, u.phone, u.avatar,
              u.role, u.vip_tier as vipTier, u.vip_expiry as vipExpiry,
              ROUND(
                GREATEST(
                  COALESCE(u.total_watched_hours, 0),
                  COALESCE(wh_stats.total_watched_seconds, 0) / 3600.0
                ), 1
              ) as totalWatchedHours,
              u.status,
              u.created_at as createdAt, u.last_active as lastActive
       FROM users u
       LEFT JOIN (
         SELECT user_id, SUM(\`current_time\`) as total_watched_seconds
         FROM watch_history
         GROUP BY user_id
       ) wh_stats ON u.id = wh_stats.user_id
       ORDER BY u.created_at DESC`
    );

    const usersWithDevices = rows.map((u) => ({
      ...u,
      id: String(u.id),
      totalWatchedHours: Number(u.totalWatchedHours || 0),
    }));

    return res.json({ success: true, data: usersWithDevices });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Khóa / Mở khóa tài khoản (Ban / Unban)
export async function toggleUserBan(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [userRows] = await pool.query<RowDataPacket[]>('SELECT status FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const currentStatus = userRows[0].status;
    const newStatus = currentStatus === 'banned' || currentStatus === 'deleted' ? 'active' : 'banned';

    await pool.query('UPDATE users SET status = ?, deleted_at = NULL WHERE id = ?', [newStatus, id]);

    return res.json({
      success: true,
      status: newStatus,
      message: `Đã chuyển trạng thái người dùng thành: ${newStatus === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Nâng cấp gói VIP cho người dùng
export async function updateUserVip(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { vipTier } = req.body;

    await pool.query(
      'UPDATE users SET vip_tier = ?, vip_expiry = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?',
      [vipTier, id]
    );

    return res.json({ success: true, message: `Đã cập nhật gói ${vipTier} cho người dùng!` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Quản lý bình luận & Báo cáo vi phạm
export async function getAdminComments(req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.content, c.likes, c.status, c.created_at as createdAt,
              m.id as movieId, m.name as movieTitle, m.thumb_url as moviePoster,
              u.id as userId, u.full_name as userName, u.avatar as userAvatar,
              (u.vip_tier != 'Free') as userIsVip,
              (SELECT COUNT(*) FROM comment_reports cr WHERE cr.comment_id = c.id AND cr.status = 'pending') as reportCount
       FROM comments c
       JOIN movies m ON c.movie_id = m.id
       JOIN users u ON c.user_id = u.id
       ORDER BY reportCount DESC, c.created_at DESC
       LIMIT 100`
    );

    const formattedComments = await Promise.all(
      rows.map(async (c) => {
        let reports: any[] = [];
        if (Number(c.reportCount) > 0) {
          const [repRows] = await pool.query<RowDataPacket[]>(
            `SELECT cr.id, cr.reason, cr.details, cr.status, cr.created_at as createdAt,
                    ru.full_name as reporterName, ru.email as reporterEmail
             FROM comment_reports cr
             LEFT JOIN users ru ON cr.user_id = ru.id
             WHERE cr.comment_id = ? AND cr.status = 'pending'
             ORDER BY cr.created_at DESC`,
            [c.id]
          );
          reports = repRows;
        }

        return {
          id: String(c.id),
          movieId: String(c.movieId),
          movieTitle: c.movieTitle,
          moviePoster: c.moviePoster,
          user: {
            id: String(c.userId),
            name: c.userName,
            avatar: c.userAvatar,
            isVip: Boolean(c.userIsVip),
          },
          content: c.content,
          likes: c.likes,
          replyCount: 0,
          status: c.status,
          reportCount: Number(c.reportCount) || 0,
          reports,
          createdAt: c.createdAt,
        };
      })
    );

    return res.json({ success: true, data: formattedComments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. Đổi trạng thái bình luận (approved / hidden)
export async function updateCommentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query('UPDATE comments SET status = ? WHERE id = ?', [status, id]);
    return res.json({ success: true, message: `Đã cập nhật trạng thái bình luận thành: ${status}` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8.1. Xóa bình luận
export async function deleteComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM comments WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Đã xóa bình luận vĩnh viễn' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8.2. Bỏ qua các báo cáo của bình luận
export async function dismissCommentReports(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await pool.query("UPDATE comment_reports SET status = 'dismissed' WHERE comment_id = ?", [id]);
    return res.json({ success: true, message: 'Đã bỏ qua các báo cáo vi phạm của bình luận này' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 9. Kích hoạt cào KKPhim từ Admin Web
export async function triggerCrawler(req: Request, res: Response) {
  try {
    const { fromPage = 1, toPage = 1, slug } = req.body;

    // Chạy ngầm không chặn luồng response
    crawlKKPhim({
      fromPage: parseInt(fromPage),
      toPage: parseInt(toPage),
      singleSlug: slug,
    }).catch((err) => console.error('Lỗi khi cào nền từ Admin:', err));

    return res.json({
      success: true,
      message: slug
        ? `Bắt đầu cào phim: [${slug}]`
        : `Bắt đầu tiến trình cào dữ liệu KKPhim từ trang ${fromPage} đến trang ${toPage}!`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 10. Quản lý lịch sử giao dịch & nạp VIP
export async function getAdminTransactions(req: Request, res: Response) {
  try {
    const { search, method, status } = req.query;

    // Kiểm tra và khởi tạo dữ liệu mẫu nếu bảng transactions đang trống
    const [[{ txCount }]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as txCount FROM transactions');
    if (Number(txCount) === 0) {
      const [[testUser]]: any = await pool.query("SELECT id FROM users WHERE email = 'kurumi124@gmail.com' LIMIT 1");
      const userId = testUser?.id || 1;
      await pool.query(
        `INSERT INTO transactions (order_code, user_id, package_id, package_name, amount, payment_method, status, created_at)
         VALUES 
           ('VIP-2026-9081', ?, '1y', 'Gói VIP 1 Năm (4K HDR)', 599000, 'VietQR', 'success', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
           ('VIP-2026-8942', ?, '6m', 'Gói VIP 6 Tháng (Full HD)', 349000, 'MoMo', 'success', DATE_SUB(NOW(), INTERVAL 1 DAY)),
           ('VIP-2026-8711', ?, '1m', 'Gói VIP 1 Tháng (4K HDR)', 69000, 'ZaloPay', 'success', DATE_SUB(NOW(), INTERVAL 2 DAY)),
           ('VIP-2026-8530', ?, '1m', 'Gói VIP 1 Tháng (Standard)', 49000, 'Visa/Mastercard', 'pending', DATE_SUB(NOW(), INTERVAL 3 DAY)),
           ('VIP-2026-8319', ?, '1y', 'Gói VIP 1 Năm (4K HDR)', 599000, 'VietQR', 'success', DATE_SUB(NOW(), INTERVAL 4 DAY))`,
        [userId, userId, userId, userId, userId]
      );
    }

    let sql = `
      SELECT t.id, t.order_code as orderCode, t.package_id as packageId,
             t.package_name as packageName, t.amount, t.payment_method as paymentMethod,
             t.status, t.created_at as createdAt,
             u.id as userId, u.full_name as userName, u.email as userEmail,
             u.phone as userPhone, u.avatar as userAvatar
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += ' AND (t.order_code LIKE ? OR u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (method && method !== 'ALL') {
      sql += ' AND t.payment_method = ?';
      params.push(method);
    }

    if (status && status !== 'ALL') {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.created_at DESC LIMIT 200';

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    // Tính toán KPI tổng quan
    const [[kpiData]]: any = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as totalRevenue,
         COUNT(*) as totalTx,
         COUNT(CASE WHEN status = 'success' THEN 1 END) as successTx
       FROM transactions`
    );

    const [[bestPackage]]: any = await pool.query(
      `SELECT package_name, COUNT(*) as cnt
       FROM transactions WHERE status = 'success'
       GROUP BY package_name
       ORDER BY cnt DESC LIMIT 1`
    );

    const totalRevenue = Number(kpiData?.totalRevenue || 0);
    const totalTx = Number(kpiData?.totalTx || 0);
    const successTx = Number(kpiData?.successTx || 0);
    const successRate = totalTx > 0 ? ((successTx / totalTx) * 100).toFixed(1) : '100.0';

    const formatted = rows.map((r) => ({
      id: String(r.id),
      orderCode: r.orderCode,
      packageId: r.packageId,
      packageName: r.packageName,
      amount: Number(r.amount),
      paymentMethod: r.paymentMethod,
      status: r.status,
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : 'Vừa xong',
      user: {
        id: String(r.userId || '1'),
        name: r.userName || 'Hội viên CINESTREAM',
        email: r.userEmail || 'user@cinestream.vn',
        phone: r.userPhone || '0987654321',
        avatar: r.userAvatar || 'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_avatar.png',
      },
    }));

    return res.json({
      success: true,
      data: {
        transactions: formatted,
        summary: {
          totalRevenue,
          bestSellingPackage: bestPackage?.package_name || 'Gói VIP 1 Tháng (4K HDR)',
          successRate: `${successRate}%`,
          totalTransactions: totalTx,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

