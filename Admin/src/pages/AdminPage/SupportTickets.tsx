import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Search,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Send,
  X,
  RefreshCw,
} from 'lucide-react';
import { type SupportTicket, INITIAL_TICKETS } from '../../services/mockData';
import { AdminAPI } from '../../services/apiService';
import { getAdminSocket } from '../../services/socket';

export const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Active Ticket Reply Modal
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Tải danh sách ticket từ Backend API
  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const res = await AdminAPI.getSupportTickets();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTickets(res.data);
      }
    } catch {
      // Giữ lại mock data nếu backend chưa có ticket
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();

    // Kết nối Socket.io cho Admin
    const socket = getAdminSocket();
    socket.emit('join_support_admin');

    const handleNewMessage = (msg: any) => {
      // 1. Nếu đang mở modal chat đúng ticket thì update hoặc append tin nhắn
      setActiveTicket((prev) => {
        if (!prev) return null;
        if (String(prev.id) === String(msg.ticketId) || String(prev.user?.id) === String(msg.userId)) {
          // Trùng id thực từ database
          const alreadyExists = prev.replies?.some((r: any) => String(r.id) === String(msg.id));
          if (alreadyExists) return prev;

          // Khớp với tin nhắn optimistic của admin dựa vào clientMsgId
          const optIndex = prev.replies?.findIndex(
            (r: any) =>
              (msg.clientMsgId && (r as any).clientMsgId === msg.clientMsgId) ||
              r.id === msg.clientMsgId
          ) ?? -1;

          let newReplies;
          if (optIndex !== -1 && prev.replies) {
            newReplies = [...prev.replies];
            newReplies[optIndex] = {
              ...newReplies[optIndex],
              id: String(msg.id),
              clientMsgId: msg.clientMsgId,
              text: msg.text,
              time: msg.time || newReplies[optIndex].time,
            };
          } else {
            newReplies = [
              ...(prev.replies || []),
              {
                id: String(msg.id),
                clientMsgId: msg.clientMsgId,
                sender: msg.sender,
                name: msg.name,
                text: msg.text,
                time: msg.time || 'Vừa xong',
              },
            ];
          }

          return {
            ...prev,
            status: msg.sender === 'user' ? 'open' : 'in_progress',
            replies: newReplies,
          };
        }
        return prev;
      });

      // 2. Cập nhật danh sách bảng tickets
      setTickets((prev) => {
        const found = prev.find((t) => String(t.id) === String(msg.ticketId));
        if (found) {
          return prev.map((t) => {
            if (String(t.id) === String(msg.ticketId)) {
              const existingReplies = t.replies || [];
              if (existingReplies.some((r: any) => String(r.id) === String(msg.id))) {
                return t;
              }
              const optIdx = existingReplies.findIndex(
                (r: any) =>
                  (msg.clientMsgId && (r as any).clientMsgId === msg.clientMsgId) ||
                  r.id === msg.clientMsgId
              );
              let updatedReplies;
              if (optIdx !== -1) {
                updatedReplies = [...existingReplies];
                updatedReplies[optIdx] = {
                  ...updatedReplies[optIdx],
                  id: String(msg.id),
                  clientMsgId: msg.clientMsgId,
                };
              } else {
                updatedReplies = [
                  ...existingReplies,
                  {
                    id: String(msg.id),
                    clientMsgId: msg.clientMsgId,
                    sender: msg.sender,
                    name: msg.name,
                    text: msg.text,
                    time: msg.time || 'Vừa xong',
                  },
                ];
              }
              return {
                ...t,
                status: msg.sender === 'user' ? 'open' : 'in_progress',
                replies: updatedReplies,
              };
            }
            return t;
          });
        } else {
          // Nếu có ticket mới hoàn toàn từ khách hàng
          loadTickets();
          return prev;
        }
      });
    };

    const handleStatusChanged = (data: { ticketId: string; status: any }) => {
      setTickets((prev) =>
        prev.map((t) => (String(t.id) === String(data.ticketId) ? { ...t, status: data.status } : t))
      );
      setActiveTicket((prev) => {
        if (prev && String(prev.id) === String(data.ticketId)) {
          return { ...prev, status: data.status };
        }
        return prev;
      });
    };

    socket.on('new_support_message', handleNewMessage);
    socket.on('ticket_status_changed', handleStatusChanged);

    return () => {
      socket.off('new_support_message', handleNewMessage);
      socket.off('ticket_status_changed', handleStatusChanged);
    };
  }, []);

  // Tự động cuộn xuống cuối khung chat
  useEffect(() => {
    if (activeTicket) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.replies]);

  // Filter Logic
  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Mở modal phản hồi và tham gia phòng của khách hàng
  const handleOpenTicket = (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    const socket = getAdminSocket();
    socket.emit('admin_join_ticket', {
      ticketId: ticket.id,
      userId: ticket.user.id,
    });
  };

  // Gửi phản hồi trực tiếp tới ĐÚNG khách hàng (qua Socket.io realtime duy nhất hoặc REST API fallback)
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim() || isSendingReply) return;

    const content = replyText.trim();
    setIsSendingReply(true);
    setReplyText('');

    const socket = getAdminSocket();
    const clientMsgId = `admin-rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Optimistic reply trên giao diện Admin
    const newReply = {
      id: clientMsgId,
      clientMsgId,
      sender: 'admin' as const,
      name: 'Admin CINESTREAM',
      text: content,
      time: 'Vừa xong',
    };

    const updatedReplies = [...(activeTicket.replies || []), newReply];
    const updatedTicket: SupportTicket = {
      ...activeTicket,
      replies: updatedReplies,
      status: 'in_progress',
    };

    setActiveTicket(updatedTicket);
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));

    // 2. Gửi tin nhắn DUY NHẤT một kênh:
    // Ưu tiên Socket.io (Backend sẽ lưu MySQL và broadcast tới các phòng)
    if (socket && socket.connected) {
      socket.emit('send_support_message', {
        ticketId: activeTicket.id,
        userId: activeTicket.user.id,
        text: content,
        sender: 'admin',
        senderName: 'Admin CINESTREAM',
        clientMsgId,
      });
      setIsSendingReply(false);
    } else {
      // Fallback qua REST API nếu socket chưa kết nối
      AdminAPI.sendTicketReply(activeTicket.id, content)
        .catch((err) => {
          console.warn('Lỗi gửi phản hồi ticket:', err);
        })
        .finally(() => {
          setIsSendingReply(false);
        });
    }
  };

  // Thay đổi trạng thái Ticket
  const handleUpdateStatus = (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    if (!activeTicket) return;

    const socket = getAdminSocket();
    socket.emit('admin_update_status', {
      ticketId,
      userId: activeTicket.user.id,
      status,
    });

    AdminAPI.updateTicketStatus(ticketId, status).catch(() => {});

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
    setActiveTicket({ ...activeTicket, status });
  };

  return (
    <div className="support-tickets-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <HelpCircle size={24} color="var(--primary)" />
            Trung Tâm Hỗ Trợ & Khiếu Nại
          </h2>
          <p className="page-subtitle">
            Tiếp nhận và xử lý sự cố phát video, lỗi kích hoạt VIP và phản hồi khiếu nại trực tiếp từ khách hàng (Realtime 24/7)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={loadTickets} title="Làm mới">
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <div className="badge badge-danger" style={{ padding: '6px 14px' }}>
            <AlertCircle size={14} />{' '}
            {tickets.filter((t) => t.status === 'open').length} Ticket chưa xử lý
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar glass-panel" style={{ padding: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo mã ticket, tên khách hàng, tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="open">Đang mở (Cần hỗ trợ)</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="resolved">Đã giải quyết xong</option>
          </select>
        </div>
      </div>

      {/* Tickets Table (Đã loại bỏ cột Chuyên Mục và Độ Ưu Tiên theo yêu cầu) */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Ticket</th>
              <th>Khách Hàng</th>
              <th>Vấn Đề / Yêu Cầu</th>
              <th>Thời Gian</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Không tìm thấy ticket nào.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                      {ticket.ticketCode}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={ticket.user.avatar}
                        alt={ticket.user.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>
                          {ticket.user.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {ticket.user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px' }}>
                      {ticket.subject}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        maxWidth: '380px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ticket.message}
                    </div>
                  </td>

                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {ticket.createdAt}
                  </td>

                  <td>
                    {ticket.status === 'open' ? (
                      <span className="badge badge-danger">Mở</span>
                    ) : ticket.status === 'in_progress' ? (
                      <span className="badge badge-warning">Đang xử lý</span>
                    ) : (
                      <span className="badge badge-success">Đã đóng</span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                      onClick={() => handleOpenTicket(ticket)}
                    >
                      <MessageSquare size={14} />
                      <span>Phản Hồi</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Chat Phản Hồi Ticket Trực Tiếp với Khách Hàng */}
      {activeTicket && (
        <div className="modal-overlay" onClick={() => setActiveTicket(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '660px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Ticket: {activeTicket.ticketCode}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Khách hàng: <strong style={{ color: '#fff' }}>{activeTicket.user.name}</strong> ({activeTicket.user.email})
                </p>
              </div>
              <button className="btn-icon" onClick={() => setActiveTicket(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '460px', overflowY: 'auto' }}>
              {/* Ticket Initial Message */}
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'rgba(255, 51, 75, 0.08)',
                  border: '1px solid rgba(255, 51, 75, 0.2)',
                  borderRadius: '10px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '6px' }}>
                  {activeTicket.subject}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeTicket.message}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Gửi lúc: {activeTicket.createdAt}
                </div>
              </div>

              {/* Chat Thread */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {activeTicket.replies?.map((reply, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: reply.sender === 'admin' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor:
                          reply.sender === 'admin'
                            ? 'var(--primary-light)'
                            : 'var(--bg-surface-elevated)',
                        border:
                          reply.sender === 'admin'
                            ? '1px solid var(--primary-border)'
                            : '1px solid var(--border)',
                        color: '#fff',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '11px',
                          color: reply.sender === 'admin' ? 'var(--primary)' : '#60a5fa',
                          marginBottom: '4px',
                        }}
                      >
                        {reply.name || (reply.sender === 'admin' ? 'Admin CINESTREAM' : activeTicket.user.name)}
                      </div>
                      {reply.text}
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {reply.time}
                    </span>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Gửi phản hồi trực tiếp tới ${activeTicket.user.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={!replyText.trim() || isSendingReply}>
                  <Send size={15} />
                  <span>Gửi</span>
                </button>
              </form>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                  onClick={() => handleUpdateStatus(activeTicket.id, 'resolved')}
                >
                  <CheckCircle size={14} color="#10b981" />
                  <span>Đánh dấu đã giải quyết</span>
                </button>
              </div>

              <button className="btn btn-secondary" onClick={() => setActiveTicket(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
