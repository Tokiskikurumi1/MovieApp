import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Search,
  CheckCircle,
  EyeOff,
  Trash2,
  AlertTriangle,
  Film,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react';
import { type CommentItem, INITIAL_COMMENTS } from '../../services/mockData';

export const CommentModeration: React.FC = () => {
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter Logic
  const filteredComments = comments.filter((c) => {
    const matchSearch =
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.movieTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Toggle Hide / Approve
  const handleToggleHide = (id: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return { ...c, status: c.status === 'hidden' ? 'approved' : 'hidden' };
        }
        return c;
      })
    );
  };

  // Delete Comment
  const handleDeleteComment = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này không?')) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="comment-moderation-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <MessageSquareQuote size={24} color="var(--primary)" />
            Kiểm Duyệt Bình Luận & Tương Tác
          </h2>
          <p className="page-subtitle">
            Duyệt bình luận phim (Facebook-style thread), lọc spam, ngôn từ độc hại và bảo vệ cộng đồng người xem
          </p>
        </div>
        <div className="badge badge-warning" style={{ padding: '6px 14px' }}>
          <AlertTriangle size={14} /> Có{' '}
          {comments.filter((c) => c.status === 'hidden').length} bình luận bị ẩn
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
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="approved">Đã phê duyệt (Hiển thị)</option>
            <option value="hidden">Đã ẩn (Spam / Vi phạm)</option>
          </select>
        </div>
      </div>

      {/* Comment Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredComments.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không tìm thấy bình luận nào.
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                borderLeft:
                  comment.status === 'hidden'
                    ? '4px solid #ef4444'
                    : '4px solid #10b981',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                {/* User & Movie Context */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
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
                  {comment.status === 'approved' ? (
                    <span className="badge badge-success">Hiển thị</span>
                  ) : (
                    <span className="badge badge-danger">Đã ẩn (Vi phạm)</span>
                  )}

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                    onClick={() => handleToggleHide(comment.id)}
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

              {/* Likes & Replies meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ThumbsUp size={13} /> {comment.likes} lượt thích
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MessageCircle size={13} /> {comment.replyCount} phản hồi
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
