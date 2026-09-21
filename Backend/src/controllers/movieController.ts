import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

// 1. Lấy danh sách phim Nổi bật (Hero Slider Banner cho Trang chủ)
export async function getFeaturedMovies(req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.name, m.origin_name, m.slug, m.thumb_url, m.poster_url,
              m.content, m.year, m.time, m.quality, m.rating, m.is_vip
       FROM movies m
       WHERE m.poster_url IS NOT NULL AND m.poster_url != ''
       ORDER BY m.year DESC, m.updated_at DESC
       LIMIT 5`
    );

    const tags = [
      'TOP 1 THỊNH HÀNH HÔM NAY',
      'SIÊU PHẨM CHIẾU RẠP',
      'BOM TẤN HÀI HÀNH ĐỘNG',
      'ĐOẠT NHIỀU GIẢI THƯỞNG',
      'PHIM ĐƯỢC XEM NHIỀU NHẤT',
    ];

    const data = await Promise.all(
      rows.map(async (m, index) => {
        const [genres] = await pool.query<RowDataPacket[]>(
          `SELECT c.name FROM categories c
           JOIN movie_categories mc ON c.id = mc.category_id
           WHERE mc.movie_id = ?`,
          [m.id]
        );

        return {
          id: m.slug || String(m.id),
          numericId: m.id,
          title: m.name,
          originalTitle: m.origin_name || m.name,
          backdrop: m.poster_url || m.thumb_url,
          poster: m.thumb_url || m.poster_url,
          tag: tags[index % tags.length],
          rating: String(m.rating || '8.8'),
          year: String(m.year || '2024'),
          duration: m.time || '120 phút',
          age: '16+',
          quality: m.quality || '4K Ultra HD',
          genres: genres.map((g) => g.name),
          description: m.content ? m.content.replace(/<[^>]*>?/gm, '').substring(0, 180) + '...' : '',
        };
      })
    );

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Lấy Top 10 Phim Thịnh hành (Trending)
export async function getTrendingMovies(req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.name, m.slug, m.thumb_url, m.poster_url, m.year, m.quality, m.rating, m.view_count
       FROM movies m
       ORDER BY m.view_count DESC, m.updated_at DESC
       LIMIT 10`
    );

    const data = await Promise.all(
      rows.map(async (m, index) => {
        const [genres] = await pool.query<RowDataPacket[]>(
          `SELECT c.name FROM categories c
           JOIN movie_categories mc ON c.id = mc.category_id
           WHERE mc.movie_id = ? LIMIT 2`,
          [m.id]
        );

        return {
          id: m.slug || String(m.id),
          numericId: m.id,
          rank: index + 1,
          title: m.name,
          rating: String(m.rating || '9.0'),
          quality: m.quality || '4K HDR',
          year: String(m.year || '2024'),
          genres: genres.map((g) => g.name),
          image: m.thumb_url || m.poster_url,
        };
      })
    );

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Lấy Phim Mới Ra Mắt (New Releases)
export async function getNewReleases(req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.name, m.slug, m.thumb_url, m.poster_url, m.year, m.quality, m.rating
       FROM movies m
       ORDER BY m.created_at DESC
       LIMIT 12`
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
          rating: String(m.rating || '8.5'),
          quality: m.quality || 'FHD',
          year: String(m.year || '2024'),
          genres: genres.map((g) => g.name),
          image: m.thumb_url || m.poster_url,
        };
      })
    );

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Lấy danh sách Tiếp Tục Xem (Continue Watching)
export async function getContinueWatching(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2; // Fallback vào user mẫu nếu chưa đăng nhập

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT wh.id as history_id, wh.progress, wh.duration_left, wh.last_watched_at,
              m.id as movie_id, m.name as title, m.slug, m.thumb_url, m.poster_url,
              e.name as episode_name
       FROM watch_history wh
       JOIN movies m ON wh.movie_id = m.id
       LEFT JOIN episodes e ON wh.episode_id = e.id
       WHERE wh.user_id = ?
       ORDER BY wh.last_watched_at DESC
       LIMIT 5`,
      [userId]
    );

    const data = rows.map((r) => ({
      id: r.slug || String(r.movie_id),
      numericId: r.movie_id,
      title: r.title,
      episode: r.episode_name || 'Tập 1',
      progress: parseFloat(r.progress) || 0.5,
      durationLeft: r.duration_left || '30 phút còn lại',
      image: r.thumb_url || r.poster_url,
    }));

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Tìm kiếm & Lọc phim danh sách (Explore & Search)
export async function getMovies(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const { category, type, search, year, isVip, quality } = req.query;

    let query = `
      SELECT DISTINCT m.id, m.name, m.origin_name, m.slug, m.thumb_url, m.poster_url,
             m.type, m.status, m.year, m.episode_current, m.quality, m.lang, m.rating, m.is_vip, m.view_count, m.updated_at
      FROM movies m
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ` JOIN movie_categories mc ON m.id = mc.movie_id
                 JOIN categories c ON mc.category_id = c.id `;
      conditions.push('(c.slug = ? OR c.name LIKE ?)');
      params.push(category, `%${category}%`);
    }

    if (type && type !== 'all') {
      if (type === 'movie') {
        conditions.push("m.type = 'single'");
      } else if (type === 'series') {
        conditions.push("m.type = 'series'");
      } else if (type === 'anime') {
        conditions.push("m.type = 'hoathinh'");
      } else {
        conditions.push('m.type = ?');
        params.push(type);
      }
    }

    if (search) {
      conditions.push('(m.name LIKE ? OR m.origin_name LIKE ? OR m.slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (year) {
      conditions.push('m.year = ?');
      params.push(year);
    }

    if (isVip !== undefined) {
      conditions.push('m.is_vip = ?');
      params.push(isVip === 'true' || isVip === '1');
    }

    if (quality) {
      conditions.push('m.quality LIKE ?');
      params.push(`%${quality}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY m.updated_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    // Tính tổng số lượng bản ghi
    let countQuery = 'SELECT COUNT(DISTINCT m.id) as total FROM movies m';
    const countParams: any[] = [];
    if (category && category !== 'all') {
      countQuery += ` JOIN movie_categories mc ON m.id = mc.movie_id
                      JOIN categories c ON mc.category_id = c.id `;
      countParams.push(category, `%${category}%`);
    }
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = countRows[0]?.total || 0;

    const formattedData = rows.map((m) => ({
      id: m.slug || String(m.id),
      numericId: m.id,
      title: m.name,
      originalTitle: m.origin_name,
      rating: String(m.rating || '8.5'),
      quality: m.quality || 'FHD',
      year: String(m.year || '2024'),
      type: m.type,
      episodeCurrent: m.episode_current,
      image: m.thumb_url || m.poster_url,
      poster: m.thumb_url,
      banner: m.poster_url,
      isVip: Boolean(m.is_vip),
    }));

    return res.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Lấy chi tiết Phim theo Slug hoặc ID
export async function getMovieDetail(req: Request, res: Response) {
  try {
    const { idOrSlug } = req.params;

    const [movies] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM movies WHERE slug = ? OR id = ? LIMIT 1',
      [idOrSlug, isNaN(Number(idOrSlug)) ? -1 : Number(idOrSlug)]
    );

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim yêu cầu' });
    }

    const movie = movies[0];

    // Lấy thể loại
    const [categories] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.name, c.slug FROM categories c
       JOIN movie_categories mc ON c.id = mc.category_id
       WHERE mc.movie_id = ?`,
      [movie.id]
    );

    // Lấy quốc gia
    const [countries] = await pool.query<RowDataPacket[]>(
      `SELECT co.id, co.name, co.slug FROM countries co
       JOIN movie_countries mc ON co.id = mc.country_id
       WHERE mc.movie_id = ?`,
      [movie.id]
    );

    // Lấy danh sách tập phim
    const [episodes] = await pool.query<RowDataPacket[]>(
      `SELECT id, server_name, name, slug, filename, link_embed, link_m3u8, is_vip
       FROM episodes WHERE movie_id = ? ORDER BY id ASC`,
      [movie.id]
    );

    // Lấy phim tương tự (cùng thể loại)
    const [similarMovies] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT m.id, m.name, m.slug, m.thumb_url, m.poster_url, m.rating
       FROM movies m
       JOIN movie_categories mc ON m.id = mc.movie_id
       WHERE mc.category_id IN (
         SELECT category_id FROM movie_categories WHERE movie_id = ?
       ) AND m.id != ?
       LIMIT 6`,
      [movie.id, movie.id]
    );

    // Tăng lượt xem
    await pool.query('UPDATE movies SET view_count = view_count + 1 WHERE id = ?', [movie.id]);

    const formattedEpisodes = episodes.map((ep, idx) => ({
      id: ep.id,
      episodeNumber: idx + 1,
      title: ep.name,
      slug: ep.slug,
      serverName: ep.server_name,
      duration: '45 phút',
      videoUrl: ep.link_m3u8 || '',
      embedUrl: ep.link_embed || '',
      thumbnail: movie.thumb_url || movie.poster_url,
      isVip: Boolean(ep.is_vip),
    }));

    const responseData = {
      id: movie.slug || String(movie.id),
      numericId: movie.id,
      title: movie.name,
      originalTitle: movie.origin_name || movie.name,
      synopsis: movie.content ? movie.content.replace(/<[^>]*>?/gm, '') : '',
      description: movie.content ? movie.content.replace(/<[^>]*>?/gm, '') : '',
      poster: movie.thumb_url || movie.poster_url,
      banner: movie.poster_url || movie.thumb_url,
      backdrop: movie.poster_url || movie.thumb_url,
      trailerUrl: movie.trailer_url || '',
      rating: parseFloat(movie.rating) || 8.9,
      voteCount: movie.vote_count || 1420,
      year: movie.year || 2024,
      duration: movie.time || '120 phút',
      quality: movie.quality || '4K HDR',
      ageLimit: '16+',
      isVip: Boolean(movie.is_vip),
      status: movie.status,
      type: movie.type,
      genres: categories.map((c) => c.name),
      categories,
      countries: countries.map((c) => c.name),
      totalEpisodes: episodes.length,
      episodes: formattedEpisodes,
      similarMovies: similarMovies.map((sm) => ({
        id: sm.slug || String(sm.id),
        title: sm.name,
        rating: String(sm.rating || '8.8'),
        image: sm.thumb_url || sm.poster_url,
      })),
    };

    return res.json({ success: true, data: responseData });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Lấy danh sách Thể loại (Categories)
export async function getCategories(req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, slug FROM categories ORDER BY name ASC'
    );
    return res.json({ success: true, data: rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
