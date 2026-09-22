import http from 'http';
import app from './app';
import { initDatabase } from './config/database';
import { initSocket } from './socket';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Tự động kiểm tra và khởi tạo MySQL Database & Tables
    await initDatabase();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🎬 Movie Backend Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`📡 Socket.io Server: đã kết nối tại http://localhost:${PORT}`);
      console.log(`📡 API Movies: http://localhost:${PORT}/api/movies`);
      console.log(`📡 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error);
    process.exit(1);
  }
}

bootstrap();
