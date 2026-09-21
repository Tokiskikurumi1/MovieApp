import axios from 'axios';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool, initDatabase } from '../config/database';

const BASE_URL = 'https://phimapi.com';
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatImgUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://phimimg.com/${url.replace(/^\//, '')}`;
}

export interface CrawlOptions {
  fromPage?: number;
  toPage?: number;
  singleSlug?: string;
  delayMs?: number;
}

export async function crawlSingleMovie(slug: string) {
  try {
    const detailUrl = `${BASE_URL}/phim/${slug}`;
    const res = await axios.get(detailUrl, { timeout: 15000 });
    
    if (!res.data || !res.data.movie) {
      console.warn(`   ⚠️ Không tìm thấy dữ liệu cho phim: ${slug}`);
      return false;
    }

    const m = res.data.movie;
    const episodesList = res.data.episodes || [];

    // 1. Lưu hoặc cập nhật thông tin Phim (Upsert)
    const [movieResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO movies (
        external_id, name, origin_name, slug, content, type, status,
        thumb_url, poster_url, trailer_url, time, episode_current, episode_total,
        quality, lang, notify, showtimes, year
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        origin_name = VALUES(origin_name),
        content = VALUES(content),
        type = VALUES(type),
        status = VALUES(status),
        thumb_url = VALUES(thumb_url),
        poster_url = VALUES(poster_url),
        trailer_url = VALUES(trailer_url),
        time = VALUES(time),
        episode_current = VALUES(episode_current),
        episode_total = VALUES(episode_total),
        quality = VALUES(quality),
        lang = VALUES(lang),
        notify = VALUES(notify),
        showtimes = VALUES(showtimes),
        year = VALUES(year),
        updated_at = CURRENT_TIMESTAMP`,
      [
        m._id || null,
        m.name || '',
        m.origin_name || '',
        m.slug,
        m.content || '',
        m.type || 'single',
        m.status || 'completed',
        formatImgUrl(m.thumb_url),
        formatImgUrl(m.poster_url),
        m.trailer_url || null,
        m.time || null,
        m.episode_current || null,
        m.episode_total || null,
        m.quality || 'HD',
        m.lang || 'Vietsub',
        m.notify || null,
        m.showtimes || null,
        m.year ? parseInt(m.year) : null,
      ]
    );

    // Lấy ID phim trong DB
    let movieId = movieResult.insertId;
    if (!movieId) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM movies WHERE slug = ? LIMIT 1',
        [m.slug]
      );
      if (rows.length > 0) {
        movieId = rows[0].id;
      }
    }

    if (!movieId) {
      console.error(`   ❌ Lỗi: Không xác định được ID phim cho slug: ${m.slug}`);
      return false;
    }

    // 2. Lưu Thể loại (categories)
    if (Array.isArray(m.category)) {
      for (const cat of m.category) {
        if (!cat.slug || !cat.name) continue;
        await pool.query(
          `INSERT INTO categories (name, slug) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [cat.name, cat.slug]
        );

        const [catRows] = await pool.query<RowDataPacket[]>(
          'SELECT id FROM categories WHERE slug = ? LIMIT 1',
          [cat.slug]
        );
        if (catRows.length > 0) {
          await pool.query(
            'INSERT IGNORE INTO movie_categories (movie_id, category_id) VALUES (?, ?)',
            [movieId, catRows[0].id]
          );
        }
      }
    }

    // 3. Lưu Quốc gia (countries)
    if (Array.isArray(m.country)) {
      for (const country of m.country) {
        if (!country.slug || !country.name) continue;
        await pool.query(
          `INSERT INTO countries (name, slug) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [country.name, country.slug]
        );

        const [cRows] = await pool.query<RowDataPacket[]>(
          'SELECT id FROM countries WHERE slug = ? LIMIT 1',
          [country.slug]
        );
        if (cRows.length > 0) {
          await pool.query(
            'INSERT IGNORE INTO movie_countries (movie_id, country_id) VALUES (?, ?)',
            [movieId, cRows[0].id]
          );
        }
      }
    }

    // 4. Lưu Danh sách tập phim (episodes)
    let totalEpsSaved = 0;
    for (const server of episodesList) {
      const serverName = server.server_name || 'Server #1';
      const serverData = server.server_data || [];

      for (const ep of serverData) {
        if (!ep.slug || !ep.name) continue;
        await pool.query(
          `INSERT INTO episodes (movie_id, server_name, name, slug, filename, link_embed, link_m3u8)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             filename = VALUES(filename),
             link_embed = VALUES(link_embed),
             link_m3u8 = VALUES(link_m3u8),
             updated_at = CURRENT_TIMESTAMP`,
          [
            movieId,
            serverName,
            ep.name,
            ep.slug,
            ep.filename || null,
            ep.link_embed || null,
            ep.link_m3u8 || null,
          ]
        );
        totalEpsSaved++;
      }
    }

    console.log(
      `   ✅ [Thành công] ${m.name} | Năm: ${m.year} | Trạng thái: ${m.episode_current} | Lưu ${totalEpsSaved} tập.`
    );
    return true;
  } catch (error: any) {
    console.error(`   ❌ Lỗi khi xử lý phim ${slug}:`, error.message);
    return false;
  }
}

export async function crawlKKPhim(options: CrawlOptions = {}) {
  const { fromPage = 1, toPage = 1, singleSlug, delayMs = 300 } = options;

  await initDatabase();

  if (singleSlug) {
    console.log(`\n🎯 Đang cào dữ liệu phim lẻ: [${singleSlug}]`);
    await crawlSingleMovie(singleSlug);
    console.log(`\n🎉 Hoàn thành cào phim: [${singleSlug}]!`);
    return;
  }

  console.log(`\n🚀 Bắt đầu cào dữ liệu KKPhim từ Trang ${fromPage} đến Trang ${toPage}`);

  for (let page = fromPage; page <= toPage; page++) {
    console.log(`\n========================================`);
    console.log(`📄 ĐANG LẤY DANH SÁCH PHIM TRANG: ${page}`);
    console.log(`========================================`);

    try {
      const res = await axios.get(`${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
        timeout: 15000,
      });

      const items = res.data?.items || [];
      const pagination = res.data?.pagination;
      console.log(`-> Tìm thấy ${items.length} phim (Tổng số trang khả dụng: ${pagination?.totalPages || '?'})`);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`[${i + 1}/${items.length}] Đang xử lý: ${item.name} (${item.slug})`);
        await crawlSingleMovie(item.slug);
        await sleep(delayMs);
      }
    } catch (err: any) {
      console.error(`❌ Lỗi khi lấy danh sách trang ${page}:`, err.message);
    }
  }

  console.log(`\n🎉 Tất cả phim đã được cào và lưu trữ thành công vào MySQL!`);
}
