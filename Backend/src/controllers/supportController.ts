import { Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getIO } from '../socket';

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

// 1. Lấy phiên chat hỗ trợ của người dùng hiện tại (hoặc tự tạo nếu chưa có)
export async function getMySupportSession(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id || 2;

    // Tìm thông tin người dùng
    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email, avatar FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    const currentUser = userRows[0] || {
      id: userId,
      full_name: 'Khách hàng CINESTREAM',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    };

    // Tìm ticket gần nhất của người dùng
    let [tickets] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    let ticket: any = null;

    if (tickets.length === 0) {
      // Tự động khởi tạo phiên hỗ trợ cho người dùng
      const ticketCode = `TK-${userId}-${Math.floor(1000 + Math.random() * 9000)}`;
      const [insertRes] = await pool.query<ResultSetHeader>(
        `INSERT INTO support_tickets (ticket_code, user_id, category, subject, message, priority, status)
         VALUES (?, ?, 'Hỗ trợ trực tuyến', 'Phiên chat trực tiếp 24/7', 'Khách hàng mở phiên chat hỗ trợ trực tuyến', 'medium', 'open')`,
        [ticketCode, userId]
      );

      const ticketId = insertRes.insertId;

      // Thêm tin nhắn chào ban đầu từ hệ thống/Admin
      await pool.query(
        `INSERT INTO ticket_replies (ticket_id, sender_type, sender_name, message)
         VALUES (?, 'admin', 'Hỗ Trợ CINESTREAM', 'Xin chào! Chúng tôi là đội ngũ hỗ trợ CINESTREAM 24/7. Bạn đang cần giải đáp hay hỗ trợ vấn đề gì hôm nay?')`,
        [ticketId]
      );

      const [newTickets] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM support_tickets WHERE id = ?',
        [ticketId]
      );
      ticket = newTickets[0];
    } else {
      ticket = tickets[0];
    }

    // Lấy toàn bộ tin nhắn phản hồi của ticket này
    const [replies] = await pool.query<RowDataPacket[]>(
      `SELECT id, ticket_id, sender_type, sender_name, message, created_at
       FROM ticket_replies
       WHERE ticket_id = ?
       ORDER BY created_at ASC`,
      [ticket.id]
    );

    const formattedReplies = replies.map((r) => ({
      id: String(r.id),
      ticketId: r.ticket_id,
      sender: r.sender_type as 'admin' | 'user',
      name: r.sender_name,
      text: r.message,
      time: formatTimeAgo(new Date(r.created_at)),
      createdAt: r.created_at,
    }));

    return res.json({
      success: true,
      data: {
        ticket: {
          id: String(ticket.id),
          numericId: ticket.id,
          ticketCode: ticket.ticket_code,
          userId: ticket.user_id,
          subject: ticket.subject,
          status: ticket.status,
          createdAt: ticket.created_at,
        },
        user: currentUser,
        replies: formattedReplies,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Lấy tất cả danh sách Ticket hỗ trợ cho Admin
export async function getAllSupportTickets(req: AuthRequest, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT st.id, st.ticket_code, st.user_id, st.subject, st.message, st.status, st.created_at,
              u.full_name as user_name, u.email as user_email, u.avatar as user_avatar
       FROM support_tickets st
       JOIN users u ON st.user_id = u.id
       ORDER BY st.created_at DESC`
    );

    const tickets = await Promise.all(
      rows.map(async (t) => {
        const [replies] = await pool.query<RowDataPacket[]>(
          `SELECT id, ticket_id, sender_type, sender_name, message, created_at
           FROM ticket_replies
           WHERE ticket_id = ?
           ORDER BY created_at ASC`,
          [t.id]
        );

        return {
          id: String(t.id),
          numericId: t.id,
          ticketCode: t.ticket_code,
          user: {
            id: t.user_id,
            name: t.user_name || 'Khách hàng',
            email: t.user_email || 'user@gmail.com',
            avatar: t.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          },
          subject: t.subject,
          message: t.message,
          status: t.status,
          createdAt: new Date(t.created_at).toLocaleString('vi-VN'),
          replies: replies.map((r) => ({
            id: String(r.id),
            sender: r.sender_type as 'admin' | 'user',
            name: r.sender_name,
            text: r.message,
            time: formatTimeAgo(new Date(r.created_at)),
            createdAt: r.created_at,
          })),
        };
      })
    );

    return res.json({ success: true, data: tickets });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Gửi tin nhắn phản hồi qua REST API (fallback cho Socket.io)
export async function sendTicketReply(req: AuthRequest, res: Response) {
  try {
    const { ticketId } = req.params;
    const { text, senderType = 'admin', senderName } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống' });
    }

    const [tickets] = await pool.query<RowDataPacket[]>(
      'SELECT id, user_id, ticket_code FROM support_tickets WHERE id = ? LIMIT 1',
      [ticketId]
    );
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ticket hỗ trợ' });
    }

    const ticket = tickets[0];
    const finalSenderName = senderName || (senderType === 'admin' ? 'Admin CINESTREAM' : 'Khách hàng');

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ticket_replies (ticket_id, sender_type, sender_name, message)
       VALUES (?, ?, ?, ?)`,
      [ticket.id, senderType, finalSenderName, text.trim()]
    );

    // Cập nhật trạng thái ticket
    const newStatus = senderType === 'admin' ? 'in_progress' : 'open';
    await pool.query('UPDATE support_tickets SET status = ? WHERE id = ?', [newStatus, ticket.id]);

    const messageObj = {
      id: String(result.insertId),
      ticketId: String(ticket.id),
      ticketCode: ticket.ticket_code,
      userId: ticket.user_id,
      sender: senderType,
      name: finalSenderName,
      text: text.trim(),
      time: 'Vừa xong',
      createdAt: new Date().toISOString(),
    };

    // Phát socket cho client và admin duy nhất một lần qua chaining
    try {
      const io = getIO();
      io.to(`support_ticket_${ticket.id}`)
        .to(`support_user_${ticket.user_id}`)
        .to('support_admin')
        .emit('new_support_message', messageObj);
    } catch {}

    return res.status(201).json({ success: true, data: messageObj });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Cập nhật trạng thái ticket (Đang mở, Đang xử lý, Đã giải quyết)
export async function updateTicketStatus(req: AuthRequest, res: Response) {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const [tickets] = await pool.query<RowDataPacket[]>(
      'SELECT id, user_id, ticket_code FROM support_tickets WHERE id = ? LIMIT 1',
      [ticketId]
    );
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ticket' });
    }

    const ticket = tickets[0];
    await pool.query('UPDATE support_tickets SET status = ? WHERE id = ?', [status, ticket.id]);

    try {
      const io = getIO();
      io.to(`support_ticket_${ticket.id}`)
        .to(`support_user_${ticket.user_id}`)
        .to('support_admin')
        .emit('ticket_status_changed', {
          ticketId: String(ticket.id),
          status,
        });
    } catch {}

    return res.json({ success: true, message: 'Đã cập nhật trạng thái ticket', status });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
