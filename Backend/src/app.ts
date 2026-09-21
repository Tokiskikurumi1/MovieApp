import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';
import userActionRoutes from './routes/userActionRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CINESTREAM API Service',
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/user', userActionRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống nội bộ máy chủ',
  });
});

export default app;
