import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'movie_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
};

// Khởi tạo Database và các bảng tự động
export async function initDatabase() {
  console.log('⏳ Đang kiểm tra và khởi tạo MySQL Database...');
  
  // Kết nối tạm thời không chỉ định database để tạo DB nếu chưa có
  const tempConnection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
  });

  try {
    await tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✅ Đã sẵn sàng database: [${dbConfig.database}]`);
  } finally {
    await tempConnection.end();
  }

  // Kết nối với database vừa tạo để nạp bảng
  const pool = mysql.createPool(dbConfig);

  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Đã khởi tạo đầy đủ các bảng (movies, categories, countries, episodes).');

    // Tự động kiểm tra và thêm cột nếu database được tạo từ phiên bản cũ
    try {
      const [cols] = await pool.query("SHOW COLUMNS FROM watch_history LIKE 'current_time'");
      if ((cols as any[]).length === 0) {
        await pool.query("ALTER TABLE watch_history ADD COLUMN `current_time` INT DEFAULT 0 COMMENT 'Số giây đã xem' AFTER progress");
      }
      const [cols2] = await pool.query("SHOW COLUMNS FROM watch_history LIKE 'duration'");
      if ((cols2 as any[]).length === 0) {
        await pool.query("ALTER TABLE watch_history ADD COLUMN duration INT DEFAULT 0 COMMENT 'Tổng thời lượng tính bằng giây' AFTER `current_time`");
      }
      const [cols3] = await pool.query("SHOW COLUMNS FROM comments LIKE 'episode_id'");
      if ((cols3 as any[]).length === 0) {
        await pool.query("ALTER TABLE comments ADD COLUMN episode_id INT NULL COMMENT 'Nếu bình luận ở tập cụ thể thì trỏ vào ID tập phim' AFTER movie_id");
      }

      await pool.query(`
        CREATE TABLE IF NOT EXISTS comment_reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          comment_id INT NOT NULL,
          user_id INT NULL,
          reason VARCHAR(255) NOT NULL,
          details TEXT NULL,
          status ENUM('pending', 'reviewed', 'dismissed') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_comment_reports_comment (comment_id),
          INDEX idx_comment_reports_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (_) {}
  }

  return pool;
}

// Pool dùng chung cho toàn bộ ứng dụng
export const pool = mysql.createPool(dbConfig);
