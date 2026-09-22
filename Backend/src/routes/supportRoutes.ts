import { Router } from 'express';
import {
  getMySupportSession,
  getAllSupportTickets,
  sendTicketReply,
  updateTicketStatus,
} from '../controllers/supportController';
import { optionalAuthenticate, authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Khách hàng lấy phiên chat của mình
router.get('/my-session', optionalAuthenticate, getMySupportSession);

// Admin lấy tất cả các ticket
router.get('/tickets', optionalAuthenticate, getAllSupportTickets);

// Gửi tin nhắn phản hồi
router.post('/tickets/:ticketId/reply', optionalAuthenticate, sendTicketReply);

// Cập nhật trạng thái ticket
router.put('/tickets/:ticketId/status', optionalAuthenticate, updateTicketStatus);

export default router;
