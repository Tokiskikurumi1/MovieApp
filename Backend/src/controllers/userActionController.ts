import { Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getIO } from '../socket';

// 1. Lấy danh sách phim yêu thích của người dùng
export async function getFavorites(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2; // Fallback vào user mẫu

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.name, m.slug, m.thumb_url, m.poster_url, m.rating, m.quality, m.year, m.type, m.time
       FROM favorites f
       JOIN movies m ON f.movie_id = m.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    const data = await Promise.all(
      rows.map(async (m) => {
        const [genres] = await pool.query<RowDataPacket[]>(
          `SELECT c.name FROM categories c
           JOIN movie_categories mc ON c.id = mc.category_id
           WHERE mc.movie_id = ? LIMIT 2`,
          [m.id]
        );

        return {
          id: m.slug || String(m.id),
          numericId: m.id,
          title: m.name,
          rating: String(m.rating || '8.8'),
          quality: m.quality || '4K HDR',
          year: String(m.year || '2024'),
          type: m.type === 'series' ? 'series' : 'movies',
          genres: genres.map((g) => g.name).join(' • ') || 'Phim hay',
          duration: m.time || '120 phút',
          image: m.thumb_url || m.poster_url,
        };
      })
    );

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Thêm hoặc Xóa khỏi danh sách yêu thích (Toggle)
export async function toggleFavorite(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const { movieIdOrSlug } = req.body;

    // Tìm ID phim
    const [movies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM movies WHERE id = ? OR slug = ? LIMIT 1',
      [isNaN(Number(movieIdOrSlug)) ? -1 : Number(movieIdOrSlug), movieIdOrSlug]
    );

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    }

    const movieId = movies[0].id;

    // Kiểm tra đã thích chưa
    const [favs] = await pool.query<RowDataPacket[]>(
      'SELECT movie_id FROM favorites WHERE user_id = ? AND movie_id = ? LIMIT 1',
      [userId, movieId]
    );

    if (favs.length > 0) {
      // Đã có -> Xóa
      await pool.query('DELETE FROM favorites WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
      return res.json({ success: true, isFavorited: false, message: 'Đã bỏ yêu thích phim' });
    } else {
      // Chưa có -> Thêm
      await pool.query('INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)', [userId, movieId]);
      return res.json({ success: true, isFavorited: true, message: 'Đã thêm phim vào danh sách yêu thích' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Lưu tiến độ xem (Continue Watching - mốc thời gian cụ thể)
export async function saveWatchProgress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const { movieIdOrSlug, episodeId, progress, durationLeft, currentTime, duration } = req.body;

    const [movies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM movies WHERE id = ? OR slug = ? LIMIT 1',
      [isNaN(Number(movieIdOrSlug)) ? -1 : Number(movieIdOrSlug), movieIdOrSlug]
    );

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    }

    const movieId = movies[0].id;
    const safeCurrentTime = Math.max(0, parseInt(currentTime) || 0);
    const safeDuration = Math.max(0, parseInt(duration) || 0);
    const computedProgress =
      safeDuration > 0
        ? Math.min(1.0, Math.max(0.0, Number((safeCurrentTime / safeDuration).toFixed(4))))
        : (progress || 0);

    await pool.query(
      `INSERT INTO watch_history (user_id, movie_id, episode_id, progress, duration_left, \`current_time\`, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         episode_id = VALUES(episode_id),
         progress = VALUES(progress),
         duration_left = VALUES(duration_left),
         \`current_time\` = VALUES(\`current_time\`),
         duration = VALUES(duration),
         last_watched_at = CURRENT_TIMESTAMP`,
      [
        userId,
        movieId,
        episodeId || null,
        computedProgress,
        durationLeft || null,
        safeCurrentTime,
        safeDuration,
      ]
    );

    return res.json({ success: true, message: 'Đã lưu tiến độ xem' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3.1. Lấy mốc thời gian xem gần nhất để tiếp tục xem (Resume watching)
export async function getWatchProgress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const { movieIdOrSlug } = req.params;

    const [movies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM movies WHERE id = ? OR slug = ? LIMIT 1',
      [isNaN(Number(movieIdOrSlug)) ? -1 : Number(movieIdOrSlug), movieIdOrSlug]
    );

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    }

    const movieId = movies[0].id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT episode_id as episodeId, \`current_time\` as currentTime, duration, progress, duration_left as durationLeft, last_watched_at as lastWatchedAt
       FROM watch_history
       WHERE user_id = ? AND movie_id = ?
       LIMIT 1`,
      [userId, movieId]
    );

    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Lấy danh sách bình luận của phim (Phân cấp kiểu Facebook - hỗ trợ lọc theo tập)
export async function getMovieComments(req: AuthRequest, res: Response) {
  try {
    const { movieIdOrSlug } = req.params;
    const currentUserId = req.user?.id || 2;
    const { episodeId } = req.query;

    const [movies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM movies WHERE id = ? OR slug = ? LIMIT 1',
      [isNaN(Number(movieIdOrSlug)) ? -1 : Number(movieIdOrSlug), movieIdOrSlug]
    );

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    }

    const movieId = movies[0].id;

    // Lấy danh sách bình luận của phim (lọc theo tập nếu có yêu cầu)
    let query = `
      SELECT c.id, c.episode_id, c.parent_id, c.content, c.rating, c.likes, c.created_at,
             u.id as user_id, u.full_name, u.avatar, u.vip_tier,
             EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) as is_liked
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.movie_id = ? AND c.status = 'approved'
    `;
    const params: any[] = [currentUserId, movieId];

    if (episodeId && episodeId !== 'all') {
      query += ' AND c.episode_id = ?';
      params.push(episodeId);
    } else if (!episodeId) {
      // Trang Chi tiết phim: chỉ lấy đánh giá/bình luận chung của cả bộ phim
      query += ' AND c.episode_id IS NULL';
    }

    query += ' ORDER BY c.created_at ASC';

    const [comments] = await pool.query<RowDataPacket[]>(query, params);

    // Gom nhóm cha - con (Nested threads)
    const parentComments: any[] = [];
    const repliesMap: { [key: number]: any[] } = {};

    for (const c of comments) {
      const commentObj = {
        id: String(c.id),
        numericId: c.id,
        episodeId: c.episode_id,
        user: c.full_name,
        avatar: c.avatar,
        time: formatTimeAgo(new Date(c.created_at)),
        content: c.content,
        rating: c.rating ? Number(c.rating) : 5,
        likes: c.likes,
        isLiked: Boolean(c.is_liked),
        isVip: c.vip_tier !== 'Free',
      };

      if (!c.parent_id) {
        parentComments.push({
          ...commentObj,
          replies: [],
          isRepliesExpanded: true,
        });
      } else {
        if (!repliesMap[c.parent_id]) {
          repliesMap[c.parent_id] = [];
        }
        repliesMap[c.parent_id].push(commentObj);
      }
    }

    // Gán replies vào parent comment tương ứng
    for (const parent of parentComments) {
      parent.replies = repliesMap[parent.numericId] || [];
    }

    // Đảo ngược để bình luận mới nhất lên đầu
    parentComments.reverse();

    return res.json({ success: true, data: parentComments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Viết bình luận mới hoặc Trả lời bình luận (hỗ trợ lưu episodeId)
export async function createComment(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const { movieIdOrSlug, episodeId, content, parentId, rating } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
    }

    const [movies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM movies WHERE id = ? OR slug = ? LIMIT 1',
      [isNaN(Number(movieIdOrSlug)) ? -1 : Number(movieIdOrSlug), movieIdOrSlug]
    );

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    }

    const movieId = movies[0].id;
    const ratingVal = rating !== undefined ? Math.max(1, Math.min(5, Number(rating))) : 5;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO comments (movie_id, episode_id, user_id, parent_id, content, rating, likes, status)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'approved')`,
      [movieId, episodeId || null, userId, parentId || null, content.trim(), ratingVal]
    );

    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT full_name, avatar, vip_tier FROM users WHERE id = ?',
      [userId]
    );
    const user = userRows[0] || {};

    const newCommentData = {
      id: String(result.insertId),
      numericId: result.insertId,
      movieId,
      episodeId: episodeId || null,
      parentId: parentId || null,
      user: user.full_name || 'Người dùng',
      avatar: user.avatar || '',
      rating: ratingVal,
      time: 'Vừa xong',
      content: content.trim(),
      likes: 0,
      isLiked: false,
      isVip: user.vip_tier !== 'Free',
      replies: [],
    };

    // Broadcast realtime qua Socket.io đúng phòng tương ứng
    try {
      const io = getIO();
      if (episodeId) {
        io.to(`movie_${movieId}_ep_${episodeId}`).emit('new_comment', newCommentData);
      } else {
        io.to(`movie_${movieId}`).emit('new_comment', newCommentData);
      }
    } catch (_) {}

    return res.status(201).json({
      success: true,
      message: 'Bình luận thành công!',
      commentId: result.insertId,
      data: newCommentData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Thả tim (Like) bình luận
export async function toggleLikeComment(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const { commentId } = req.params;

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
      await pool.query('UPDATE comments SET likes = GREATEST(0, likes - 1) WHERE id = ?', [commentId]);
      return res.json({ success: true, isLiked: false });
    } else {
      await pool.query('INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)', [commentId, userId]);
      await pool.query('UPDATE comments SET likes = likes + 1 WHERE id = ?', [commentId]);
      return res.json({ success: true, isLiked: true });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

// 7. Xóa 1 mục khỏi lịch sử xem
export async function deleteWatchHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const { movieIdOrHistoryId } = req.params;

    await pool.query(
      `DELETE wh FROM watch_history wh
       LEFT JOIN movies m ON wh.movie_id = m.id
       WHERE wh.user_id = ? AND (wh.id = ? OR wh.movie_id = ? OR m.slug = ?)`,
      [userId, movieIdOrHistoryId, movieIdOrHistoryId, movieIdOrHistoryId]
    );

    return res.json({ success: true, message: 'Đã xóa khỏi lịch sử xem' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. Xóa toàn bộ lịch sử xem
export async function clearAllWatchHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;

    await pool.query('DELETE FROM watch_history WHERE user_id = ?', [userId]);

    return res.json({ success: true, message: 'Đã xóa toàn bộ lịch sử xem' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 9. Lấy lịch sử giao dịch nạp VIP của người dùng (Transactions)
export async function getTransactions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, order_code as code, package_name as planName, amount,
              payment_method as paymentMethod, status, created_at as createdAt
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const formatted = rows.map((tx) => {
      let paymentIcon = 'wallet-outline';
      const pm = String(tx.paymentMethod);
      if (pm.includes('Visa') || pm.includes('Card')) {
        paymentIcon = 'card-outline';
      } else if (pm.includes('QR')) {
        paymentIcon = 'qr-code-outline';
      } else if (pm.includes('MoMo')) {
        paymentIcon = 'phone-portrait-outline';
      }

      return {
        id: String(tx.id),
        code: tx.code,
        planName: tx.planName,
        amount: `${Number(tx.amount).toLocaleString('vi-VN')}đ`,
        rawAmount: Number(tx.amount),
        paymentMethod: tx.paymentMethod,
        paymentIcon,
        status: tx.status,
        date: new Date(tx.createdAt).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 10. Đăng ký & Nâng cấp Gói cước VIP (Subscription Upgrade)
export async function upgradeSubscription(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const { packageId = '6m', paymentMethod = 'MoMo' } = req.body;

    // Chuẩn hóa phương thức thanh toán theo ENUM DB: ('MoMo','VietQR','ZaloPay','Visa/Mastercard')
    let validMethod: 'MoMo' | 'VietQR' | 'ZaloPay' | 'Visa/Mastercard' = 'MoMo';
    const pmLower = String(paymentMethod).toLowerCase();
    if (pmLower.includes('vietqr') || pmLower.includes('qr')) {
      validMethod = 'VietQR';
    } else if (pmLower.includes('zalo')) {
      validMethod = 'ZaloPay';
    } else if (pmLower.includes('visa') || pmLower.includes('master') || pmLower.includes('card')) {
      validMethod = 'Visa/Mastercard';
    } else {
      validMethod = 'MoMo';
    }

    const planConfig: Record<
      string,
      { dbPkgId: '1m' | '6m' | '1y'; name: string; amount: number; days: number; tier: 'VIP Standard' | 'VIP 4K' }
    > = {
      'plan-1m': { dbPkgId: '1m', name: 'Gói 1 Tháng VIP', amount: 69000, days: 30, tier: 'VIP Standard' },
      '1m': { dbPkgId: '1m', name: 'Gói 1 Tháng VIP', amount: 69000, days: 30, tier: 'VIP Standard' },
      'plan-6m': { dbPkgId: '6m', name: 'Gói 6 Tháng VIP 4K', amount: 349000, days: 180, tier: 'VIP 4K' },
      '6m': { dbPkgId: '6m', name: 'Gói 6 Tháng VIP 4K', amount: 349000, days: 180, tier: 'VIP 4K' },
      'plan-12m': { dbPkgId: '1y', name: 'Gói 1 Năm Siêu Cấp', amount: 649000, days: 365, tier: 'VIP 4K' },
      '1y': { dbPkgId: '1y', name: 'Gói 1 Năm Siêu Cấp', amount: 649000, days: 365, tier: 'VIP 4K' },
    };

    const selected = planConfig[packageId] || planConfig['6m'];
    const orderCode = `CINE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Tạo bản ghi giao dịch thành công trong transactions
    await pool.query(
      `INSERT INTO transactions (order_code, user_id, package_id, package_name, amount, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, 'success')`,
      [orderCode, userId, selected.dbPkgId, selected.name, selected.amount, validMethod]
    );

    // 2. Nâng cấp hạn VIP cho User
    await pool.query(
      `UPDATE users 
       SET vip_tier = ?, 
           vip_expiry = DATE_ADD(GREATEST(COALESCE(vip_expiry, NOW()), NOW()), INTERVAL ? DAY)
       WHERE id = ?`,
      [selected.tier, selected.days, userId]
    );

    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email, vip_tier, vip_expiry FROM users WHERE id = ?',
      [userId]
    );

    return res.json({
      success: true,
      message: `Chúc mừng! Bạn đã nâng cấp thành công ${selected.name}!`,
      data: {
        orderCode,
        planName: selected.name,
        amount: selected.amount,
        vipTier: userRows[0]?.vip_tier,
        vipExpiry: userRows[0]?.vip_expiry,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
