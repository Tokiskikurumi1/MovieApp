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

// 2. Lấy Top Phim Thịnh hành (Trending) - Hỗ trợ lọc theo danh mục & xếp hạng
export async function getTrendingMovies(req: Request, res: Response) {
  try {
    const category = req.query.category as string;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    let sql = `
      SELECT DISTINCT m.id, m.name, m.origin_name, m.slug, m.thumb_url, m.poster_url,
             m.year, m.quality, m.rating, m.view_count, m.content, m.updated_at
      FROM movies m
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += `
        JOIN movie_categories mc ON m.id = mc.movie_id
        JOIN categories c ON mc.category_id = c.id
        WHERE c.slug = ? OR c.name = ?
      `;
      params.push(category, category);
    }

    sql += ` ORDER BY m.view_count DESC, m.rating DESC, m.updated_at DESC LIMIT ?`;
    params.push(limit);

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    const data = await Promise.all(
      rows.map(async (m, index) => {
        const [genres] = await pool.query<RowDataPacket[]>(
          `SELECT c.name, c.slug FROM categories c
           JOIN movie_categories mc ON c.id = mc.category_id
           WHERE mc.movie_id = ?`,
          [m.id]
        );

        const genreNames = genres.map((g) => g.name);

        return {
          id: m.slug || String(m.id),
          numericId: m.id,
          rank: index + 1,
          currentRank: index + 1,
          title: m.name,
          rating: String(m.rating || '8.8'),
          quality: m.quality || '4K HDR',
          year: String(m.year || '2024'),
          genres: genreNames,
          tags: genreNames.slice(0, 2).concat([m.quality || 'HD']),
          synopsis: m.content
            ? m.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
            : 'Chưa có nội dung tóm tắt cho phim này.',
          image: m.thumb_url || m.poster_url,
          backdrop: m.poster_url || m.thumb_url,
        };
      })
    );

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Lấy Phim Mới Ra Mắt (New Releases) - Sắp xếp theo ngày phát hành gần nhất
export async function getNewReleases(req: Request, res: Response) {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.name, m.origin_name, m.slug, m.thumb_url, m.poster_url,
              m.year, m.quality, m.rating, m.content, m.created_at, m.updated_at
       FROM movies m
       ORDER BY m.year DESC, m.created_at DESC, m.id DESC
       LIMIT ?`,
      [limit]
    );

    const data = await Promise.all(
      rows.map(async (m) => {
        const [genres] = await pool.query<RowDataPacket[]>(
          `SELECT c.name FROM categories c
           JOIN movie_categories mc ON c.id = mc.category_id
           WHERE mc.movie_id = ?`,
          [m.id]
        );

        const genreNames = genres.map((g) => g.name);

        return {
          id: m.slug || String(m.id),
          numericId: m.id,
          title: m.name,
          rating: String(m.rating || '8.5'),
          quality: m.quality || 'FHD',
          year: String(m.year || '2024'),
          genres: genreNames,
          tags: genreNames.slice(0, 2).concat([m.quality || 'FHD']),
          synopsis: m.content
            ? m.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
            : 'Chưa có nội dung tóm tắt cho phim này.',
          image: m.thumb_url || m.poster_url,
          backdrop: m.poster_url || m.thumb_url,
        };
      })
    );

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Lấy danh sách Lịch Sử Xem / Tiếp Tục Xem (Watch History)
export async function getContinueWatching(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = ((req.query.search as string) || '').trim();
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE wh.user_id = ?';
    const params: any[] = [userId];

    if (search) {
      whereClause += ' AND (m.name LIKE ? OR m.origin_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Đếm tổng số bản ghi trong lịch sử
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(wh.id) as total
       FROM watch_history wh
       JOIN movies m ON wh.movie_id = m.id
       ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT wh.id as history_id, wh.progress, wh.duration_left, wh.last_watched_at,
              m.id as movie_id, m.name as title, m.slug, m.thumb_url, m.poster_url,
              e.name as episode_name
       FROM watch_history wh
       JOIN movies m ON wh.movie_id = m.id
       LEFT JOIN episodes e ON wh.episode_id = e.id
       ${whereClause}
       ORDER BY wh.last_watched_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const data = rows.map((r) => ({
      id: r.slug || String(r.movie_id),
      movieId: r.slug || String(r.movie_id),
      numericId: r.movie_id,
      historyId: r.history_id,
      title: r.title,
      episode: r.episode_name || 'Tập 1',
      progress: parseFloat(r.progress) || 0.5,
      durationLeft: r.duration_left || '30 phút còn lại',
      timeWatched: r.last_watched_at ? formatTimeAgo(new Date(r.last_watched_at)) : 'Gần đây',
      image: r.thumb_url || r.poster_url,
    }));

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
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

// 5. Tìm kiếm & Lọc phim danh sách (Explore & Search)
export async function getMovies(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const { category, type, search, year, isVip, quality, sort } = req.query;

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

    let orderBy = 'm.updated_at DESC';
    if (sort === 'rating') {
      orderBy = 'm.rating DESC, m.updated_at DESC';
    } else if (sort === 'latest') {
      orderBy = 'm.year DESC, m.updated_at DESC';
    } else if (sort === 'popular') {
      orderBy = 'm.view_count DESC, m.updated_at DESC';
    }

    query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const countParams = params.slice(0, -2);
    let countQuery = 'SELECT COUNT(DISTINCT m.id) as total FROM movies m';
    if (category && category !== 'all') {
      countQuery += ` JOIN movie_categories mc ON m.id = mc.movie_id
                      JOIN categories c ON mc.category_id = c.id `;
    }
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = countRows[0]?.total || 0;

    const formattedData = await Promise.all(
      rows.map(async (m) => {
        const [genres] = await pool.query<RowDataPacket[]>(
          `SELECT c.name FROM categories c
           JOIN movie_categories mc ON c.id = mc.category_id
           WHERE mc.movie_id = ? LIMIT 3`,
          [m.id]
        );

        return {
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
          genres: genres.map((g) => g.name).join(', ') || 'Phim hay',
        };
      })
    );

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

    // Lấy phim tương tự thông minh bằng Content-Based Recommendation
    const similarMovies = await calculateMovieRecommendations(movie.id, movie.type, 6);

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
      similarMovies,
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

// 8. Thuật toán gợi ý phim thông minh nâng cao (Multi-Factor Content-Based Engine)
export async function calculateMovieRecommendations(movieId: number, movieType: string, limit: number = 10) {
  // Lấy thông tin phim gốc (target movie)
  const [targetRows] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, type, year, rating FROM movies WHERE id = ?',
    [movieId]
  );
  const targetMovie = targetRows[0] || { id: movieId, type: movieType, year: 2024, rating: 8.5 };

  // 1. Lấy danh sách thể loại của phim gốc
  const [catRows] = await pool.query<RowDataPacket[]>(
    `SELECT mc.category_id, c.name FROM movie_categories mc
     JOIN categories c ON mc.category_id = c.id
     WHERE mc.movie_id = ?`,
    [movieId]
  );
  const categoryIds = catRows.map((r) => r.category_id);
  const categoryNames = catRows.map((r) => r.name);

  // 2. Lấy danh sách quốc gia của phim gốc
  const [countryRows] = await pool.query<RowDataPacket[]>(
    `SELECT mc.country_id, co.name FROM movie_countries mc
     JOIN countries co ON mc.country_id = co.id
     WHERE mc.movie_id = ?`,
    [movieId]
  );
  const countryIds = countryRows.map((r) => r.country_id);

  let recommendedRows: RowDataPacket[] = [];

  if (categoryIds.length > 0) {
    const catPlaceholders = categoryIds.map(() => '?').join(',');
    const hasCountries = countryIds.length > 0;
    const countryPlaceholders = hasCountries ? countryIds.map(() => '?').join(',') : '';

    const countryCondition = hasCountries
      ? `(CASE WHEN EXISTS (
           SELECT 1 FROM movie_countries mco 
           WHERE mco.movie_id = m.id AND mco.country_id IN (${countryPlaceholders})
         ) THEN 2.5 ELSE 0.0 END)`
      : '0.0';

    // Công thức tính điểm tương đồng đa chiều (Multi-Factor Content Similarity):
    // - Độ trùng khớp thể loại: COUNT(DISTINCT mc.category_id) * 3.5
    // - Độ trùng khớp định dạng (lẻ/bộ/hoạt hình): CASE WHEN m.type = ? THEN 2.0
    // - Độ trùng khớp quốc gia sản xuất: countryCondition (2.5)
    // - Khoảng cách năm phát hành: GREATEST(0, 1.5 - ABS(m.year - ?) / 8.0)
    // - Điểm chất lượng phim: rating * 0.4
    // - Độ phổ biến/lượt xem: LOG10(GREATEST(view_count, 1)) * 0.5
    const query = `
      SELECT m.id, m.name, m.origin_name, m.slug, m.thumb_url, m.poster_url,
             m.rating, m.year, m.quality, m.episode_current, m.view_count, m.type,
             (
               (COUNT(DISTINCT mc.category_id) * 3.5)
               + (CASE WHEN m.type = ? THEN 2.0 ELSE 0.0 END)
               + ${countryCondition}
               + (GREATEST(0, 1.5 - ABS(COALESCE(m.year, 2024) - ?) / 8.0))
               + (COALESCE(m.rating, 8.0) * 0.4)
               + (LOG10(GREATEST(m.view_count, 1)) * 0.5)
             ) AS similarity_score,
             COUNT(DISTINCT mc.category_id) AS matched_genres_count
      FROM movies m
      JOIN movie_categories mc ON m.id = mc.movie_id
      WHERE mc.category_id IN (${catPlaceholders})
        AND m.id != ?
      GROUP BY m.id
      ORDER BY similarity_score DESC, m.view_count DESC, m.rating DESC
      LIMIT ?
    `;

    const params = [
      movieType,
      targetMovie.year || 2024,
      ...(hasCountries ? countryIds : []),
      ...categoryIds,
      movieId,
      limit,
    ];

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    recommendedRows = rows;
  } else {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.name, m.origin_name, m.slug, m.thumb_url, m.poster_url,
              m.rating, m.year, m.quality, m.episode_current, m.view_count, m.type,
              1 as matched_genres_count
       FROM movies m
       WHERE m.id != ?
       ORDER BY (CASE WHEN m.type = ? THEN 1 ELSE 0 END) DESC, m.rating DESC, m.view_count DESC
       LIMIT ?`,
      [movieId, movieType, limit]
    );
    recommendedRows = rows;
  }

  // Nếu số lượng chưa đủ limit, bổ sung thêm các phim nổi bật khác
  let finalRows = [...recommendedRows];
  if (finalRows.length < limit) {
    const existingIds = [movieId, ...finalRows.map((r) => r.id)];
    const needed = limit - finalRows.length;
    const [backupRows] = await pool.query<RowDataPacket[]>(
      `SELECT m.id, m.name, m.origin_name, m.slug, m.thumb_url, m.poster_url,
              m.rating, m.year, m.quality, m.episode_current, m.view_count, m.type,
              1 as matched_genres_count
       FROM movies m
       WHERE m.id NOT IN (${existingIds.map(() => '?').join(',')})
       ORDER BY m.rating DESC, m.view_count DESC
       LIMIT ?`,
      [...existingIds, needed]
    );
    finalRows = [...finalRows, ...backupRows];
  }

  // Format dữ liệu đồng nhất kèm Match Score (%) & Match Reason
  const formatted = await Promise.all(
    finalRows.map(async (m, index) => {
      const [genres] = await pool.query<RowDataPacket[]>(
        `SELECT c.id, c.name FROM categories c
         JOIN movie_categories mc ON c.id = mc.category_id
         WHERE mc.movie_id = ? LIMIT 3`,
        [m.id]
      );

      const [countries] = await pool.query<RowDataPacket[]>(
        `SELECT co.id, co.name FROM countries co
         JOIN movie_countries mc ON co.id = mc.country_id
         WHERE mc.movie_id = ? LIMIT 2`,
        [m.id]
      );

      const viewsFormatted =
        m.view_count >= 1000000
          ? `${(m.view_count / 1000000).toFixed(1)}M lượt xem`
          : m.view_count >= 1000
          ? `${(m.view_count / 1000).toFixed(0)}K lượt xem`
          : `${m.view_count || 120} lượt xem`;

      const matchedGenreCount = m.matched_genres_count || 1;
      const sharesCountry = countries.some((c) => countryIds.includes(c.id));
      const yearDiff = Math.abs((targetMovie.year || 2024) - (m.year || 2024));

      const calculatedPercent = Math.min(
        99,
        Math.max(
          70,
          Math.round(
            68 +
              matchedGenreCount * 7 +
              (sharesCountry ? 8 : 0) +
              (m.type === targetMovie.type ? 5 : 0) +
              Math.max(0, 5 - yearDiff) -
              index * 1.5
          )
        )
      );

      let matchReason = `Tương thích ${calculatedPercent}%`;
      const candGenreNames = genres.map((g) => g.name);
      const sharedGenres = candGenreNames.filter((gn) => categoryNames.includes(gn));

      if (sharedGenres.length > 0 && sharesCountry) {
        matchReason = `Hợp gu ${calculatedPercent}% • Cùng ${sharedGenres[0]} & ${countries[0]?.name || 'quốc gia'}`;
      } else if (sharedGenres.length > 1) {
        matchReason = `Hợp gu ${calculatedPercent}% • Cùng ${sharedGenres.slice(0, 2).join(' & ')}`;
      } else if (sharedGenres.length === 1) {
        matchReason = `Độ tương thích ${calculatedPercent}% • Cùng thể loại ${sharedGenres[0]}`;
      } else if (sharesCountry) {
        matchReason = `Độ tương thích ${calculatedPercent}% • Cùng phong cách ${countries[0]?.name || ''}`;
      } else {
        matchReason = `Gợi ý nổi bật ${calculatedPercent}% • Phim được xem nhiều`;
      }

      return {
        id: m.slug || String(m.id),
        numericId: m.id,
        title: m.name,
        originalTitle: m.origin_name || m.name,
        rating: String(m.rating || '8.8'),
        year: String(m.year || '2024'),
        quality: m.quality || '4K HDR',
        type: m.type,
        episodesBadge: m.type === 'single' ? 'Phim lẻ' : (m.episode_current || 'Trọn bộ'),
        views: viewsFormatted,
        image: m.thumb_url || m.poster_url,
        poster: m.thumb_url || m.poster_url,
        backdrop: m.poster_url || m.thumb_url,
        tags: genres.map((g) => g.name),
        genres: genres.map((g) => g.name),
        matchScore: calculatedPercent,
        matchPercentage: `${calculatedPercent}%`,
        matchReason,
      };
    })
  );

  return formatted;
}

// 9. API Lấy danh sách gợi ý phim theo ID hoặc Slug
export async function getMovieRecommendations(req: Request, res: Response) {
  try {
    const { idOrSlug } = req.params;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 10));

    const [movies] = await pool.query<RowDataPacket[]>(
      'SELECT id, type FROM movies WHERE slug = ? OR id = ? LIMIT 1',
      [idOrSlug, isNaN(Number(idOrSlug)) ? -1 : Number(idOrSlug)]
    );

    if (movies.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim yêu cầu' });
    }

    const movie = movies[0];
    const recommendations = await calculateMovieRecommendations(movie.id, movie.type, limit);

    return res.json({ success: true, data: recommendations });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 10. Thuật toán gợi ý cá nhân hóa thông minh cho người dùng (Personalized Recommendation Engine)
export async function getPersonalizedRecommendations(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const limit = Math.min(30, Math.max(1, parseInt(req.query.limit as string) || 12));

    let candidateRows: RowDataPacket[] = [];
    let topUserGenreNames: string[] = [];
    let isPersonalized = false;

    if (userId) {
      // 1. Phân tích lịch sử xem (watch_history) và danh sách yêu thích (favorites)
      const [historyRows] = await pool.query<RowDataPacket[]>(
        `SELECT wh.movie_id, wh.progress, wh.last_watched_at
         FROM watch_history wh
         WHERE wh.user_id = ?
         ORDER BY wh.last_watched_at DESC
         LIMIT 20`,
        [userId]
      );

      const [favRows] = await pool.query<RowDataPacket[]>(
        `SELECT f.movie_id, f.created_at
         FROM favorites f
         WHERE f.user_id = ?
         ORDER BY f.created_at DESC
         LIMIT 20`,
        [userId]
      );

      const userMovieIds = Array.from(
        new Set([
          ...historyRows.map((r) => r.movie_id),
          ...favRows.map((r) => r.movie_id),
        ])
      );

      if (userMovieIds.length > 0) {
        isPersonalized = true;

        // 2. Trích xuất sở thích người dùng (Top Genres)
        const [userGenres] = await pool.query<RowDataPacket[]>(
          `SELECT mc.category_id, c.name, COUNT(*) as count
           FROM movie_categories mc
           JOIN categories c ON mc.category_id = c.id
           WHERE mc.movie_id IN (${userMovieIds.map(() => '?').join(',')})
           GROUP BY mc.category_id, c.name
           ORDER BY count DESC
           LIMIT 5`,
          userMovieIds
        );

        topUserGenreNames = userGenres.map((g) => g.name);
        const topGenreIds = userGenres.map((g) => g.category_id);

        // Trích xuất quốc gia yêu thích (Top Countries)
        const [userCountries] = await pool.query<RowDataPacket[]>(
          `SELECT mc.country_id, co.name, COUNT(*) as count
           FROM movie_countries mc
           JOIN countries co ON mc.country_id = co.id
           WHERE mc.movie_id IN (${userMovieIds.map(() => '?').join(',')})
           GROUP BY mc.country_id, co.name
           ORDER BY count DESC
           LIMIT 3`,
          userMovieIds
        );
        const topCountryIds = userCountries.map((c) => c.country_id);

        // 3. Đề xuất phim phù hợp theo Taste Vector (loại trừ các phim đã xem/yêu thích)
        if (topGenreIds.length > 0) {
          const catPlaceholders = topGenreIds.map(() => '?').join(',');
          const hasCountryFilter = topCountryIds.length > 0;
          const countryPlaceholders = hasCountryFilter ? topCountryIds.map(() => '?').join(',') : '';

          const countryBoost = hasCountryFilter
            ? `(CASE WHEN EXISTS (
                 SELECT 1 FROM movie_countries mco 
                 WHERE mco.movie_id = m.id AND mco.country_id IN (${countryPlaceholders})
               ) THEN 3.0 ELSE 0.0 END)`
            : '0.0';

          const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT m.id, m.name, m.origin_name, m.slug, m.thumb_url, m.poster_url,
                    m.rating, m.year, m.quality, m.episode_current, m.view_count, m.type,
                    COUNT(DISTINCT mc.category_id) as matched_genre_count,
                    (
                      (COUNT(DISTINCT mc.category_id) * 30.0 / ?)
                      + ${countryBoost}
                      + (COALESCE(m.rating, 8.0) * 2.5)
                      + (LOG10(GREATEST(m.view_count, 1)) * 2.0)
                    ) as personal_score
             FROM movies m
             JOIN movie_categories mc ON m.id = mc.movie_id
             WHERE mc.category_id IN (${catPlaceholders})
               AND m.id NOT IN (${userMovieIds.map(() => '?').join(',')})
             GROUP BY m.id
             ORDER BY personal_score DESC, m.rating DESC, m.view_count DESC
             LIMIT ?`,
            [
              topGenreIds.length,
              ...(hasCountryFilter ? topCountryIds : []),
              ...topGenreIds,
              ...userMovieIds,
              limit,
            ]
          );

          candidateRows = rows;
        }
      }
    }

    // 4. Cold-Start Fallback (Dành cho khách chưa đăng nhập hoặc tài khoản mới chưa có lịch sử xem)
    if (candidateRows.length < limit) {
      const existingIds = candidateRows.map((r) => r.id);
      const needed = limit - candidateRows.length;
      const excludeClause =
        existingIds.length > 0
          ? `WHERE m.id NOT IN (${existingIds.map(() => '?').join(',')})`
          : '';

      const [fallbackRows] = await pool.query<RowDataPacket[]>(
        `SELECT m.id, m.name, m.origin_name, m.slug, m.thumb_url, m.poster_url,
                m.rating, m.year, m.quality, m.episode_current, m.view_count, m.type,
                1 as matched_genre_count
         FROM movies m
         ${excludeClause}
         ORDER BY m.rating DESC, m.view_count DESC, m.year DESC
         LIMIT ?`,
        [...existingIds, needed]
      );

      candidateRows = [...candidateRows, ...fallbackRows];
    }

    // 5. Chuẩn hóa dữ liệu với Match Score và nhãn đề xuất trực quan
    const data = await Promise.all(
      candidateRows.map(async (m, index) => {
        const [genres] = await pool.query<RowDataPacket[]>(
          `SELECT c.name FROM categories c
           JOIN movie_categories mc ON c.id = mc.category_id
           WHERE mc.movie_id = ? LIMIT 3`,
          [m.id]
        );

        const genreNames = genres.map((g) => g.name);

        const viewsFormatted =
          m.view_count >= 1000000
            ? `${(m.view_count / 1000000).toFixed(1)}M lượt xem`
            : m.view_count >= 1000
            ? `${(m.view_count / 1000).toFixed(0)}K lượt xem`
            : `${m.view_count || 120} lượt xem`;

        let matchScore: number;
        let matchReason: string;

        if (isPersonalized && topUserGenreNames.length > 0) {
          const matchedShared = genreNames.filter((gn) => topUserGenreNames.includes(gn));
          matchScore = Math.min(99, Math.max(82, 98 - index * 2 + (matchedShared.length > 1 ? 3 : 0)));
          if (matchedShared.length > 0) {
            matchReason = `Hợp gu ${matchScore}% • Thể loại ${matchedShared[0]} bạn hay xem`;
          } else {
            matchReason = `Hợp gu ${matchScore}% • Xu hướng phù hợp với bạn`;
          }
        } else {
          matchScore = Math.min(99, Math.max(80, 97 - index * 2));
          const tagsList = [
            `Thịnh hành ${matchScore}% • Siêu phẩm được xem nhiều`,
            `Đánh giá cao ${matchScore}% • Khán giả yêu thích`,
            `Đề xuất ${matchScore}% • Tuyển chọn hôm nay`,
            `Khuyên xem ${matchScore}% • Bom tấn chất lượng cao`,
          ];
          matchReason = tagsList[index % tagsList.length];
        }

        return {
          id: m.slug || String(m.id),
          numericId: m.id,
          title: m.name,
          originalTitle: m.origin_name || m.name,
          rating: String(m.rating || '8.8'),
          year: String(m.year || '2024'),
          quality: m.quality || '4K HDR',
          type: m.type,
          episodesBadge: m.type === 'single' ? 'Phim lẻ' : (m.episode_current || 'Trọn bộ'),
          views: viewsFormatted,
          image: m.thumb_url || m.poster_url,
          poster: m.thumb_url || m.poster_url,
          backdrop: m.poster_url || m.thumb_url,
          tags: genreNames,
          genres: genreNames,
          matchScore,
          matchPercentage: `${matchScore}%`,
          matchReason,
          isPersonalized,
        };
      })
    );

    return res.json({
      success: true,
      data,
      metadata: {
        isPersonalized,
        topGenres: topUserGenreNames,
        total: data.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}


