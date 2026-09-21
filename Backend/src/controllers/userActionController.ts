import { Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

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

    const data = rows.map((m) => ({
      id: m.slug || String(m.id),
      numericId: m.id,
      title: m.name,
      rating: String(m.rating || '8.8'),
      quality: m.quality || '4K HDR',
      year: String(m.year || '2024'),
      type: m.type,
      duration: m.time || '120 phút',
      image: m.thumb_url || m.poster_url,
    }));

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

// 3. Lưu tiến độ xem (Continue Watching)
export async function saveWatchProgress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const { movieIdOrSlug, episodeId, progress, durationLeft } = req.body;

    const [movies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM movies WHERE id = ? OR slug = ? LIMIT 1',
      [isNaN(Number(movieIdOrSlug)) ? -1 : Number(movieIdOrSlug), movieIdOrSlug]
    );

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    }

    const movieId = movies[0].id;

    await pool.query(
      `INSERT INTO watch_history (user_id, movie_id, episode_id, progress, duration_left)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         episode_id = VALUES(episode_id),
         progress = VALUES(progress),
         duration_left = VALUES(duration_left),
         last_watched_at = CURRENT_TIMESTAMP`,
      [userId, movieId, episodeId || null, progress || 0, durationLeft || null]
    );

    return res.json({ success: true, message: 'Đã lưu tiến độ xem' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Lấy danh sách bình luận của phim (Phân cấp kiểu Facebook)
export async function getMovieComments(req: AuthRequest, res: Response) {
  try {
    const { movieIdOrSlug } = req.params;
    const currentUserId = req.user?.id || 2;

    const [movies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM movies WHERE id = ? OR slug = ? LIMIT 1',
      [isNaN(Number(movieIdOrSlug)) ? -1 : Number(movieIdOrSlug), movieIdOrSlug]
    );

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim' });
    }

    const movieId = movies[0].id;

    // Lấy tất cả bình luận của phim
    const [comments] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.parent_id, c.content, c.likes, c.created_at,
              u.id as user_id, u.full_name, u.avatar, u.vip_tier,
              EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) as is_liked
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.movie_id = ? AND c.status = 'approved'
       ORDER BY c.created_at ASC`,
      [currentUserId, movieId]
    );

    // Gom nhóm cha - con (Nested threads)
    const parentComments: any[] = [];
    const repliesMap: { [key: number]: any[] } = {};

    for (const c of comments) {
      const commentObj = {
        id: String(c.id),
        numericId: c.id,
        user: c.full_name,
        avatar: c.avatar,
        time: formatTimeAgo(new Date(c.created_at)),
        content: c.content,
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

// 5. Viết bình luận mới hoặc Trả lời bình luận
export async function createComment(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const { movieIdOrSlug, content, parentId } = req.body;

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

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO comments (movie_id, user_id, parent_id, content, likes, status)
       VALUES (?, ?, ?, ?, 0, 'approved')`,
      [movieId, userId, parentId || null, content.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Bình luận thành công!',
      commentId: result.insertId,
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
