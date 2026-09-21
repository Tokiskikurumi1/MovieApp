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
  }

  return pool;
}

// Pool dùng chung cho toàn bộ ứng dụng
export const pool = mysql.createPool(dbConfig);
