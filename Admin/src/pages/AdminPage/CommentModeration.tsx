import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Search,
  CheckCircle,
  EyeOff,
  Trash2,
  AlertTriangle,
  Film,
  ThumbsUp,
  RefreshCw,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { AdminAPI } from '../../services/apiService';
import { getAdminSocket } from '../../services/socket';
import { INITIAL_COMMENTS } from '../../services/mockData';

export interface CommentReport {
  id: number;
  reason: string;
  details?: string;
  reporterName?: string;
  reporterEmail?: string;
  createdAt: string;
}

export interface ModerationCommentItem {
  id: string;
  movieId?: string;
  movieTitle: string;
  moviePoster?: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isVip: boolean;
  };
  content: string;
  likes: number;
  replyCount?: number;
  status: 'approved' | 'hidden' | 'pending';
  reportCount?: number;
  reports?: CommentReport[];
  createdAt: string;
}

export const CommentModeration: React.FC = () => {
  const [comments, setComments] = useState<ModerationCommentItem[]>(INITIAL_COMMENTS as any[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [newReportAlert, setNewReportAlert] = useState<{
    id?: number;
    movieTitle?: string;
    commentContent?: string;
    reason?: string;
    reporterName?: string;
  } | null>(null);

  // Tải danh sách bình luận từ máy chủ
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await AdminAPI.getComments();
      if (res && res.success && Array.isArray(res.data)) {
        setComments(res.data);
      }
    } catch (err) {
      console.warn('Lỗi nạp bình luận từ API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo kết nối Socket.io và lắng nghe báo cáo vi phạm realtime
  useEffect(() => {
    fetchComments();

    const socket = getAdminSocket();
    socket.emit('join_admin');

    const handleNewReport = (reportPayload: any) => {
      console.log('🔔 [Admin Socket] Nhận báo cáo bình luận mới:', reportPayload);
      setNewReportAlert(reportPayload);
      fetchComments();

      // Tự đóng cảnh báo sau 15 giây
      const timer = setTimeout(() => {
        setNewReportAlert(null);
      }, 15000);

      return () => clearTimeout(timer);
    };

    socket.on('new_comment_report', handleNewReport);

    return () => {
      socket.off('new_comment_report', handleNewReport);
    };
  }, []);

  // Filter Logic
  const filteredComments = comments.filter((c) => {
    const matchSearch =
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.movieTitle && c.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchStatus = true;
    if (statusFilter === 'reported') {
      matchStatus = (c.reportCount || 0) > 0;
    } else if (statusFilter !== 'ALL') {
      matchStatus = c.status === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  // Toggle Hide / Approve
  const handleToggleHide = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'hidden' ? 'approved' : 'hidden';
    try {
      await AdminAPI.updateCommentStatus(id, nextStatus);
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            return { ...c, status: nextStatus };
          }
          return c;
        })
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái bình luận');
    }
  };

  // Delete Comment
  const handleDeleteComment = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này khỏi hệ thống không?')) {
      try {
        await AdminAPI.deleteComment(id);
        setComments((prev) => prev.filter((c) => c.id !== id));
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa bình luận');
      }
    }
  };

  // Dismiss Reports
  const handleDismissReports = async (id: string) => {
    try {
      await AdminAPI.dismissReports(id);
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            return { ...c, reportCount: 0, reports: [] };
          }
          return c;
        })
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi khi bỏ qua báo cáo');
    }
  };

  const reportedCommentsCount = comments.filter((c) => (c.reportCount || 0) > 0).length;
  const hiddenCommentsCount = comments.filter((c) => c.status === 'hidden').length;

  return (
    <div className="comment-moderation-page">
      {/* Realtime Notification Banner when comment is reported */}
      {newReportAlert && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            marginBottom: '20px',
            backgroundColor: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '14px' }}>
                Cảnh báo Realtime: Có bình luận vừa bị người xem báo cáo!
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Phim: <strong style={{ color: '#fff' }}>{newReportAlert.movieTitle}</strong> • Lý do: <span style={{ color: '#f87171', fontWeight: 600 }}>{newReportAlert.reason}</span>
                {newReportAlert.commentContent && (
                  <span style={{ fontStyle: 'italic', marginLeft: '6px' }}>
                    "{newReportAlert.commentContent.substring(0, 50)}..."
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '12.5px', backgroundColor: '#ef4444' }}
              onClick={() => {
                setStatusFilter('reported');
                setNewReportAlert(null);
              }}
            >
              Xem bình luận bị báo cáo
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              onClick={() => setNewReportAlert(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <MessageSquareQuote size={24} color="var(--primary)" />
            Kiểm Duyệt Bình Luận & Báo Cáo Vi Phạm
          </h2>
          <p className="page-subtitle">
            Duyệt bình luận phim, tiếp nhận báo cáo vi phạm realtime từ khán giả, lọc spoil và bảo vệ cộng đồng CINESTREAM
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {reportedCommentsCount > 0 && (
            <div
              className="badge badge-danger"
              style={{
                padding: '6px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#ef4444',
              }}
              onClick={() => setStatusFilter('reported')}
            >
              <AlertTriangle size={14} /> Có {reportedCommentsCount} bình luận bị báo cáo
            </div>
          )}

          <div className="badge badge-warning" style={{ padding: '6px 14px' }}>
            <AlertTriangle size={14} /> Có {hiddenCommentsCount} bình luận bị ẩn
          </div>

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={fetchComments}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar glass-panel" style={{ padding: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo nội dung bình luận, người đăng, tên phim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <select
            className="form-select"
            style={{ width: '220px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="reported">⚠️ Bị báo cáo ({reportedCommentsCount})</option>
            <option value="approved">Đã phê duyệt (Hiển thị)</option>
            <option value="hidden">Đã ẩn (Spam / Vi phạm)</option>
          </select>
        </div>
      </div>

      {/* Comment Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredComments.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không tìm thấy bình luận nào phù hợp với bộ lọc.
          </div>
        ) : (
          filteredComments.map((comment) => {
            const hasReports = (comment.reportCount || 0) > 0;

            return (
              <div
                key={comment.id}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  borderLeft:
                    comment.status === 'hidden'
                      ? '4px solid #ef4444'
                      : hasReports
                      ? '4px solid #f59e0b'
                      : '4px solid #10b981',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  {/* User & Movie Context */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={
                        comment.user.avatar &&
                        (comment.user.avatar.startsWith('http://') || comment.user.avatar.startsWith('https://'))
                          ? comment.user.avatar
                          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
                      }
                      alt={comment.user.name}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>
                          {comment.user.name}
                        </span>
                        {comment.user.isVip && (
                          <span className="badge badge-vip" style={{ fontSize: '10.5px' }}>
                            VIP 4K
                          </span>
                        )}
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          • {comment.createdAt}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary)', marginTop: '2px' }}>
                        <Film size={12} />
                        <span>{comment.movieTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {hasReports && (
                      <span
                        className="badge badge-danger"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.18)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        ⚠️ {comment.reportCount} Báo cáo
                      </span>
                    )}

                    {comment.status === 'approved' ? (
                      <span className="badge badge-success">Hiển thị</span>
                    ) : (
                      <span className="badge badge-danger">Đã ẩn (Vi phạm)</span>
                    )}

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                      onClick={() => handleToggleHide(comment.id, comment.status)}
                    >
                      {comment.status === 'hidden' ? (
                        <>
                          <CheckCircle size={14} color="#10b981" />
                          <span>Hiện lại</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} color="#ef4444" />
                          <span>Ẩn đi</span>
                        </>
                      )}
                    </button>

                    <button
                      className="btn-icon"
                      style={{ color: '#ef4444' }}
                      title="Xóa bình luận vĩnh viễn"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Comment Content Body */}
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    color: comment.status === 'hidden' ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontStyle: comment.status === 'hidden' ? 'italic' : 'normal',
                  }}
                >
                  {comment.content}
                </div>

                {/* Report Details Warning Box if reported */}
                {hasReports && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      borderRadius: '10px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 700, fontSize: '13px' }}>
                        <ShieldAlert size={16} />
                        <span>Danh sách báo cáo vi phạm ({comment.reportCount} lượt)</span>
                      </div>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '3px 10px', fontSize: '11.5px', color: 'var(--text-secondary)' }}
                        onClick={() => handleDismissReports(comment.id)}
                      >
                        <Check size={12} style={{ marginRight: '4px' }} />
                        Bỏ qua các báo cáo này
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {comment.reports && comment.reports.length > 0 ? (
                        comment.reports.map((rep, idx) => (
                          <div
                            key={rep.id || idx}
                            style={{
                              fontSize: '12.5px',
                              color: 'var(--text-secondary)',
                              padding: '4px 0',
                              borderBottom: idx < (comment.reports?.length || 0) - 1 ? '1px dashed rgba(255,255,255,0.06)' : 'none',
                            }}
                          >
                            • <strong style={{ color: '#fff' }}>{rep.reason}</strong>
                            {rep.details ? ` — Chi tiết: "${rep.details}"` : ''}
                            {rep.reporterName ? (
                              <span style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginLeft: '6px' }}>
                                (Bởi: {rep.reporterName})
                              </span>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Bình luận bị gắn cờ vi phạm bởi khán giả.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Likes & Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ThumbsUp size={13} /> {comment.likes} lượt thích
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
