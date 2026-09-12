import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Send,
  X,
} from 'lucide-react';
import { type SupportTicket, INITIAL_TICKETS } from '../../services/mockData';

export const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Active Ticket Reply Modal
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

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

  // Send Reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText) return;

    const newReply = {
      sender: 'admin' as const,
      name: 'Admin CINESTREAM',
      text: replyText,
      time: new Date().toLocaleString('vi-VN'),
    };

    const updatedReplies = [...(activeTicket.replies || []), newReply];
    const updatedTicket: SupportTicket = {
      ...activeTicket,
      replies: updatedReplies,
      status: 'in_progress',
    };

    setActiveTicket(updatedTicket);
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    setReplyText('');
  };

  // Change Status
  const handleUpdateStatus = (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket({ ...activeTicket, status });
    }
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
            Tiếp nhận và xử lý sự cố phát video, lỗi kích hoạt VIP và phản hồi khiếu nại từ khách hàng
          </p>
        </div>
        <div className="badge badge-danger" style={{ padding: '6px 14px' }}>
          <AlertCircle size={14} />{' '}
          {tickets.filter((t) => t.status === 'open').length} Ticket chưa xử lý
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

      {/* Tickets Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Ticket</th>
              <th>Khách Hàng</th>
              <th>Chuyên Mục</th>
              <th>Vấn Đề / Yêu Cầu</th>
              <th>Độ Ưu Tiên</th>
              <th>Thời Gian</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
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
                    <span className="badge badge-neutral">{ticket.category}</span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px' }}>
                      {ticket.subject}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        maxWidth: '320px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ticket.message}
                    </div>
                  </td>

                  <td>
                    {ticket.priority === 'high' ? (
                      <span className="badge badge-danger">Khẩn cấp</span>
                    ) : (
                      <span className="badge badge-warning">Bình thường</span>
                    )}
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
                      onClick={() => setActiveTicket(ticket)}
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

      {/* Modal Chat Phản Hồi Ticket */}
      {activeTicket && (
        <div className="modal-overlay" onClick={() => setActiveTicket(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Ticket: {activeTicket.ticketCode}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Khách hàng: {activeTicket.user.name} ({activeTicket.user.email})
                </p>
              </div>
              <button className="btn-icon" onClick={() => setActiveTicket(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '450px', overflowY: 'auto' }}>
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
                  Gửi lúc: {activeTicket.createdAt} • Chuyên mục: {activeTicket.category}
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
                      <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--primary)', marginBottom: '4px' }}>
                        {reply.name}
                      </div>
                      {reply.text}
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {reply.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập câu trả lời gửi đến người dùng..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <Send size={15} />
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
