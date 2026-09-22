import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';

let io: Server | null = null;

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

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    // =========================================================================
    // 1. PHẦN BÌNH LUẬN & ĐÁNH GIÁ PHIM THEO PHÒNG (MOVIE COMMENTS)
    // =========================================================================
    socket.on('join_movie', async (movieIdOrSlug: string | number) => {
      try {
        const movieId = await resolveMovieId(movieIdOrSlug);
        if (movieId) {
          const room = `movie_${movieId}`;
          socket.join(room);
        }
      } catch (err) {
        console.error('Lỗi join_movie socket:', err);
      }
    });

    socket.on('leave_movie', async (movieIdOrSlug: string | number) => {
      try {
        const movieId = await resolveMovieId(movieIdOrSlug);
        if (movieId) {
          const room = `movie_${movieId}`;
          socket.leave(room);
        }
      } catch (err) {
        console.error('Lỗi leave_movie socket:', err);
      }
    });

    socket.on('send_comment', async (data: {
      movieIdOrSlug: string | number;
      content: string;
      rating?: number;
      userId?: number;
      userName?: string;
      userAvatar?: string;
    }) => {
      try {
        const { movieIdOrSlug, content, rating = 5, userId = 2, userName, userAvatar } = data;
        if (!content || !content.trim()) return;

        const movieId = await resolveMovieId(movieIdOrSlug);
        if (!movieId) return;

        const [result] = await pool.query<ResultSetHeader>(
          `INSERT INTO comments (movie_id, user_id, content, rating, likes, status)
           VALUES (?, ?, ?, ?, 0, 'approved')`,
          [movieId, userId, content.trim(), rating]
        );

        const commentId = result.insertId;
        let senderName = userName || 'Khán giả CINESTREAM';
        let senderAvatar = userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop';

        const [users] = await pool.query<RowDataPacket[]>(
          'SELECT full_name, avatar FROM users WHERE id = ? LIMIT 1',
          [userId]
        );
        if (users.length > 0) {
          senderName = users[0].full_name || senderName;
          senderAvatar = users[0].avatar || senderAvatar;
        }

        const [ratingRows] = await pool.query<RowDataPacket[]>(
          `SELECT AVG(rating) as avgRating, COUNT(id) as totalRatings
           FROM comments
           WHERE movie_id = ? AND rating IS NOT NULL AND status = 'approved'`,
          [movieId]
        );

        const avgRating = ratingRows[0]?.avgRating ? Number(ratingRows[0].avgRating).toFixed(1) : null;
        const totalRatings = ratingRows[0]?.totalRatings || 0;

        if (avgRating) {
          await pool.query('UPDATE movies SET rating = ? WHERE id = ?', [avgRating, movieId]);
        }

        const commentData = {
          id: String(commentId),
          numericId: commentId,
          clientCommentId: (data as any).clientCommentId,
          user: senderName,
          avatar: senderAvatar,
          rating: Number(rating) || 5,
          time: 'Vừa xong',
          createdAt: new Date().toISOString(),
          content: content.trim(),
          likes: 0,
          isLiked: false,
        };

        const room = `movie_${movieId}`;
        io?.to(room).emit('new_comment', commentData);

        if (avgRating) {
          io?.to(room).emit('update_rating', { movieId, rating: avgRating, totalRatings });
        }
      } catch (err) {
        console.error('Lỗi send_comment socket:', err);
      }
    });

    socket.on('like_comment', async (data: {
      commentId: string | number;
      movieIdOrSlug: string | number;
      userId?: number;
    }) => {
      try {
        const { commentId, movieIdOrSlug, userId = 2 } = data;
        const movieId = await resolveMovieId(movieIdOrSlug);
        const cId = Number(commentId);
        if (!cId || isNaN(cId)) return;

        const [likes] = await pool.query<RowDataPacket[]>(
          'SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ? LIMIT 1',
          [cId, userId]
        );

        let isLikedNow = false;
        if (likes.length > 0) {
          await pool.query('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?', [cId, userId]);
          await pool.query('UPDATE comments SET likes = GREATEST(0, likes - 1) WHERE id = ?', [cId]);
          isLikedNow = false;
        } else {
          await pool.query('INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)', [cId, userId]);
          await pool.query('UPDATE comments SET likes = likes + 1 WHERE id = ?', [cId]);
          isLikedNow = true;
        }

        const [rows] = await pool.query<RowDataPacket[]>('SELECT likes FROM comments WHERE id = ?', [cId]);
        const currentLikes = rows[0]?.likes || 0;

        if (movieId) {
          io?.to(`movie_${movieId}`).emit('comment_liked', {
            commentId: String(cId),
            likes: currentLikes,
            userId,
          });
        }
      } catch (err) {
        console.error('Lỗi like_comment socket:', err);
      }
    });

    // =========================================================================
    // 2. PHẦN CHAT TRỰC TIẾP HỖ TRỢ & KHIẾU NẠI (SUPPORT LIVE CHAT: CLIENT <-> ADMIN)
    // =========================================================================

    // A. Khách hàng tham gia phòng hỗ trợ của chính mình
    socket.on('join_support_user', (data: { userId: number | string; ticketId?: number | string }) => {
      const uId = String(data.userId);
      const userRoom = `support_user_${uId}`;
      socket.join(userRoom);

      if (data.ticketId) {
        socket.join(`support_ticket_${data.ticketId}`);
      }
      console.log(`[Socket] User ${uId} joined room ${userRoom}`);
    });

    // B. Admin tham gia sảnh hỗ trợ để lắng nghe tất cả tin nhắn & ticket
    socket.on('join_support_admin', () => {
      socket.join('support_admin');
      console.log('[Socket] Admin joined support_admin room');
    });

    // C. Admin mở xem chi tiết hội thoại của 1 ticket cụ thể
    socket.on('admin_join_ticket', (data: { ticketId: number | string; userId?: number | string }) => {
      const ticketRoom = `support_ticket_${data.ticketId}`;
      socket.join(ticketRoom);
      if (data.userId) {
        socket.join(`support_user_${data.userId}`);
      }
      console.log(`[Socket] Admin joined ticket room ${ticketRoom}`);
    });

    // D. Gửi tin nhắn hỗ trợ (Áp dụng cho cả Khách hàng và Admin)
    socket.on('send_support_message', async (data: {
      ticketId: number | string;
      userId: number | string;
      text: string;
      sender: 'user' | 'admin';
      senderName?: string;
      clientMsgId?: string;
    }) => {
      try {
        const { ticketId, userId, text, sender, senderName, clientMsgId } = data;
        if (!text || !text.trim()) return;

        const tId = Number(ticketId);
        const uId = Number(userId);

        const finalSenderName =
          senderName || (sender === 'admin' ? 'Admin CINESTREAM' : 'Khách hàng');

        // 1. Lưu tin nhắn vào MySQL bảng ticket_replies duy nhất 1 lần
        const [result] = await pool.query<ResultSetHeader>(
          `INSERT INTO ticket_replies (ticket_id, sender_type, sender_name, message)
           VALUES (?, ?, ?, ?)`,
          [tId, sender, finalSenderName, text.trim()]
        );

        // 2. Cập nhật trạng thái ticket
        const newStatus = sender === 'admin' ? 'in_progress' : 'open';
        await pool.query('UPDATE support_tickets SET status = ? WHERE id = ?', [newStatus, tId]);

        const [tRows] = await pool.query<RowDataPacket[]>(
          'SELECT ticket_code FROM support_tickets WHERE id = ? LIMIT 1',
          [tId]
        );
        const ticketCode = tRows[0]?.ticket_code || `TK-${tId}`;

        // Đối tượng tin nhắn hoàn chỉnh kèm clientMsgId để deduplicate ở client
        const messageObj = {
          id: String(result.insertId),
          clientMsgId: clientMsgId || undefined,
          ticketId: String(tId),
          ticketCode,
          userId: uId,
          sender,
          name: finalSenderName,
          text: text.trim(),
          time: 'Vừa xong',
          createdAt: new Date().toISOString(),
        };

        // 3. Phát tin nhắn đến duy nhất một lần tới các phòng liên quan bằng union chaining
        // Tránh tình trạng socket tham gia nhiều phòng (ví dụ user vừa ở support_user vừa ở support_ticket) nhận trùng lặp nhiều lần
        io?.to(`support_ticket_${tId}`)
          .to(`support_user_${uId}`)
          .to('support_admin')
          .emit('new_support_message', messageObj);

        console.log(`[Socket Support] Message sent to user ${uId} on ticket ${tId}: "${text.trim()}"`);
      } catch (err) {
        console.error('Lỗi send_support_message socket:', err);
      }
    });

    // E. Cập nhật trạng thái ticket từ Admin
    socket.on('admin_update_status', async (data: {
      ticketId: number | string;
      userId: number | string;
      status: 'open' | 'in_progress' | 'resolved';
    }) => {
      try {
        const { ticketId, userId, status } = data;
        const tId = Number(ticketId);
        const uId = Number(userId);

        await pool.query('UPDATE support_tickets SET status = ? WHERE id = ?', [status, tId]);

        const payload = { ticketId: String(tId), status };
        io?.to(`support_user_${uId}`)
          .to(`support_ticket_${tId}`)
          .to('support_admin')
          .emit('ticket_status_changed', payload);
      } catch (err) {
        console.error('Lỗi admin_update_status socket:', err);
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io chưa được khởi tạo!');
  }
  return io;
}

async function resolveMovieId(idOrSlug: string | number): Promise<number | null> {
  if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
    return Number(idOrSlug);
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM movies WHERE slug = ? LIMIT 1',
    [String(idOrSlug)]
  );
  return rows.length > 0 ? rows[0].id : null;
}
