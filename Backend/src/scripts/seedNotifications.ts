import { pool } from '../config/database';

async function migrateAndSeed() {
  try {
    const [cols]: any = await pool.query("SHOW COLUMNS FROM notifications LIKE 'image'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE notifications ADD COLUMN image VARCHAR(500) NULL AFTER movie_slug");
      console.log('Added column image to notifications');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_notification_reads (
        user_id INT NOT NULL,
        notification_id INT NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, notification_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created or verified user_notification_reads table');

    // Kiểm tra xem đã có dữ liệu chưa
    const [existing]: any = await pool.query('SELECT COUNT(*) as count FROM notifications');
    if (existing[0].count === 0) {
      const [movies]: any = await pool.query('SELECT id, name, slug, poster_url, thumb_url FROM movies LIMIT 2');
      const movie1 = movies[0];
      const movie2 = movies[1];

      if (movie1) {
        await pool.query(
          `INSERT INTO notifications (title, message, type, movie_id, movie_slug, image, target_audience, action_route, total_sent)
           VALUES (?, ?, 'movie', ?, ?, ?, 'all', ?, 1250)`,
          [
            `Bom Tấn Mới: ${movie1.name} 🎬`,
            `${movie1.name} đã chính thức có mặt trên CINESTREAM với chuẩn hình ảnh Full HD & Vietsub. Xem ngay hôm nay!`,
            movie1.id,
            movie1.slug,
            movie1.poster_url || movie1.thumb_url,
            `/movie/${movie1.slug}`,
          ]
        );
      }

      if (movie2) {
        await pool.query(
          `INSERT INTO notifications (title, message, type, movie_id, movie_slug, image, target_audience, action_route, total_sent)
           VALUES (?, ?, 'movie', ?, ?, ?, 'all', ?, 1250)`,
          [
            `Tập Mới Lên Sóng: ${movie2.name} 🔥`,
            `Thưởng thức ngay những tập tiếp theo đầy kịch tính của ${movie2.name} độc quyền trên ứng dụng.`,
            movie2.id,
            movie2.slug,
            movie2.poster_url || movie2.thumb_url,
            `/watch/${movie2.slug}`,
          ]
        );
      }

      await pool.query(
        `INSERT INTO notifications (title, message, type, target_audience, action_route, total_sent)
         VALUES (?, ?, 'vip', 'all', '/sub-layout/billing-subscription', 1250)`,
        [
          'Ưu Đãi Đặc Biệt: Nâng Cấp Gói VIP Giảm 30% ⭐',
          'Trải nghiệm không giới hạn kho phim bản quyền 4K, không quảng cáo và âm thanh vòm sống động.',
        ]
      );

      console.log('Inserted sample notifications');
    }

    console.log('Migration & seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateAndSeed();
