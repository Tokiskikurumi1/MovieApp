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

      // Migration: Bảng thông báo (notifications) & lượt đọc (user_notification_reads)
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

      try {
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
      } catch (colErr) {
        console.warn('Lỗi kiểm tra cột bảng notifications:', colErr);
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

      // Migration: Hỗ trợ xóa mềm người dùng (status 'deleted' & deleted_at)
      try {
        await pool.query("ALTER TABLE users MODIFY COLUMN status ENUM('active', 'suspended', 'banned', 'deleted') DEFAULT 'active'");
        const [delCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'deleted_at'");
        if ((delCols as any[]).length === 0) {
          await pool.query("ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL AFTER last_active");
        }
      } catch (_) {}

      // Cập nhật trạng thái tất cả phim sang 'ongoing' (Đang chiếu)
      try {
        await pool.query("UPDATE movies SET status = 'ongoing' WHERE status IS NULL OR status = 'draft' OR status = 'completed' OR status = ''");
      } catch (_) {}

      // Migration: Thuế GTGT 10% & Hóa Đơn Điện Tử (E-Invoice) cho bảng transactions
      try {
        const [txCols] = await pool.query<any[]>("SHOW COLUMNS FROM transactions");
        const existingTxCols = txCols.map((c: any) => c.Field);

        if (!existingTxCols.includes('vat_amount')) {
          await pool.query("ALTER TABLE transactions ADD COLUMN vat_amount DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Thuế GTGT 10%' AFTER amount");
        }
        if (!existingTxCols.includes('net_amount')) {
          await pool.query("ALTER TABLE transactions ADD COLUMN net_amount DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Doanh thu thuần chưa thuế' AFTER vat_amount");
        }
        if (!existingTxCols.includes('invoice_code')) {
          await pool.query("ALTER TABLE transactions ADD COLUMN invoice_code VARCHAR(100) NULL COMMENT 'Mã hóa đơn điện tử e-Invoice' AFTER net_amount");
        }
        if (!existingTxCols.includes('invoice_url')) {
          await pool.query("ALTER TABLE transactions ADD COLUMN invoice_url VARCHAR(500) NULL COMMENT 'Link tra cứu hóa đơn điện tử' AFTER invoice_code");
        }

        // Cập nhật các giao dịch cũ tự động tính VAT 10% và sinh mã hóa đơn
        await pool.query(`
          UPDATE transactions 
          SET vat_amount = ROUND((amount / 1.1) * 0.1, 2),
              net_amount = ROUND(amount / 1.1, 2),
              invoice_code = CONCAT('HD-', YEAR(created_at), '-', LPAD(id, 6, '0'))
          WHERE invoice_code IS NULL OR invoice_code = ''
        `);
      } catch (txErr) {
        console.warn('Lỗi migration hóa đơn & thuế bảng transactions:', txErr);
      }
    } catch (_) {}
  }

  return pool;
}

// Pool dùng chung cho toàn bộ ứng dụng
export const pool = mysql.createPool(dbConfig);
