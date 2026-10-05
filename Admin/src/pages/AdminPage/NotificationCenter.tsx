import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Send,
  CheckCircle2,
  Trash2,
  Film,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { AdminAPI } from '../../services/apiService';

interface NotificationRecord {
  id: string;
  dbId?: number;
  title: string;
  message: string;
  type: string;
  movieId?: number;
  movieSlug?: string;
  movieName?: string;
  image?: string;
  targetAudience: 'all' | 'vip' | 'free';
  actionRoute: string;
  sentAt: string;
  readCount: number;
  totalSent: number;
}

interface MovieOption {
  id: number;
  name: string;
  slug: string;
  thumb_url?: string;
  poster_url?: string;
  type?: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [moviesList, setMoviesList] = useState<MovieOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState<'movie' | 'vip' | 'promo' | 'system'>('movie');
  const [targetAudience, setTargetAudience] = useState<'all' | 'vip' | 'free'>('all');
  const [actionRoute, setActionRoute] = useState('/(tabs)');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Tải danh sách phim và lịch sử thông báo
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [moviesRes, notifsRes] = await Promise.all([
        AdminAPI.getMovies({ limit: 100 }),
        AdminAPI.getNotifications(),
      ]);

      if (moviesRes && moviesRes.data) {
        setMoviesList(moviesRes.data);
      }
      if (notifsRes && notifsRes.data) {
        setNotifications(notifsRes.data);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu NotificationCenter:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedMovie = moviesList.find((m) => String(m.id) === selectedMovieId);

  // Khi chọn một phim từ danh sách
  const handleSelectMovie = (movieIdStr: string) => {
    setSelectedMovieId(movieIdStr);
    if (!movieIdStr) {
      setActionRoute('/(tabs)');
      return;
    }

    const movie = moviesList.find((m) => String(m.id) === movieIdStr);
    if (movie) {
      setNotifType('movie');
      setTitle(`🎬 Tập Mới: ${movie.name}`);
      setMessage(`Bộ phim ${movie.name} vừa cập nhật nội dung hấp dẫn trên CINESTREAM. Mở xem ngay chuẩn Full HD!`);
      setActionRoute(`/movie/${movie.slug}`);
    }
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!');
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        type: notifType,
        movieId: selectedMovie ? selectedMovie.id : undefined,
        movieSlug: selectedMovie ? selectedMovie.slug : undefined,
        image: selectedMovie?.poster_url || selectedMovie?.thumb_url || undefined,
        targetAudience,
        actionRoute,
      };

      const res = await AdminAPI.createNotification(payload);

      if (res && res.data) {
        setNotifications((prev) => [res.data, ...prev]);
      } else {
        await loadData();
      }

      setSendSuccess(true);
      setTitle('');
      setMessage('');
      setSelectedMovieId('');
      setActionRoute('/(tabs)');

      setTimeout(() => setSendSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi thông báo');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNotification = async (id: string | number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này khỏi lịch sử?')) return;
    try {
      await AdminAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa thông báo');
    }
  };

  return (
    <div className="notification-center-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <BellRing size={24} color="var(--primary)" />
            Trung Tâm Gửi Thông Báo Push (Mobile App)
          </h2>
          <p className="page-subtitle">
            Bắn thông báo trực tiếp tới điện thoại người dùng, chọn phim thật trong cơ sở dữ liệu để mở đúng phim trên Mobile App
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={loadData}
            disabled={isLoading}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          {/* <div className="badge badge-success" style={{ padding: '6px 14px' }}>
            <Smartphone size={14} /> Socket.io & Push Broadcast
          </div> */}
        </div>
      </div>

      {/* Main Grid (Composer & Live Phone Preview) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Form Soạn Thông Báo */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Send size={18} color="var(--primary)" />
            Soạn Thông Báo Mới
          </h3>

          {sendSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#10b981',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Đã bắn thông báo thành công đến các thiết bị di động qua Socket.io!</span>
            </div>
          )}

          <form onSubmit={handleSendPush}>
            {/* Chọn phim từ Database */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Film size={14} color="var(--primary)" />
                Chọn Phim Liên Kết (Phim Thật Trong Kho)
              </label>
              <select
                className="form-select"
                value={selectedMovieId}
                onChange={(e) => handleSelectMovie(e.target.value)}
              >
                <option value="">-- Không liên kết phim cụ thể (Thông báo chung) --</option>
                {moviesList.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    🎬 {movie.name} ({movie.slug})
                  </option>
                ))}
              </select>
              {selectedMovie && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 51, 75, 0.08)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 51, 75, 0.2)',
                  }}
                >
                  <img
                    src={selectedMovie.thumb_url || selectedMovie.poster_url}
                    alt={selectedMovie.name}
                    style={{ width: '32px', height: '44px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                      {selectedMovie.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Slug: {selectedMovie.slug}
                    </div>
                  </div>
                  <Sparkles size={16} color="var(--primary)" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Tiêu Đề Thông Báo</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Tập Mới Đã Lên Sóng! 🔥"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nội Dung Thông Báo (Tối đa 150 ký tự)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="VD: Deadpool & Wolverine vừa cập nhật bản chuẩn 4K HDR & Dolby Atmos. Thưởng thức ngay!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Loại Thông Báo</label>
                <select
                  className="form-select"
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value as any)}
                >
                  <option value="movie">Phim Mới Ra Mắt 🎬</option>
                  <option value="vip">Ưu Đãi Gói VIP ⭐</option>
                  <option value="promo">Quà Tặng & Sự Kiện 🎁</option>
                  <option value="system">Hệ Thống & Bảo Mật 🛡️</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Đối Tượng Nhận</label>
                <select
                  className="form-select"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                >
                  <option value="all">Tất cả người dùng</option>
                  <option value="vip">Chỉ Hội Viên VIP ⭐</option>
                  <option value="free">Chỉ Tài Khoản Free</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Đích Đến Khi Bấm Vào (Deep Link / Action Route)</label>
              <select
                className="form-select"
                value={actionRoute}
                onChange={(e) => setActionRoute(e.target.value)}
              >
                {selectedMovie ? (
                  <>
                    <option value={`/movie/${selectedMovie.slug}`}>
                      Màn hình Chi Tiết Phim: /movie/{selectedMovie.slug}
                    </option>
                    <option value={`/watch/${selectedMovie.slug}`}>
                      Trình Phát Phim Trực Tiếp: /watch/{selectedMovie.slug}
                    </option>
                  </>
                ) : null}
                <option value="/(tabs)">Trang Chủ App (/(tabs))</option>
                <option value="/sub-layout/billing-subscription">Màn hình Nâng Cấp Gói VIP</option>
                <option value="/sub-layout/help-center">Trung Tâm Hỗ Trợ 24/7</option>
                <option value="/(tabs)/explore">Khám Phá Phim (Explore)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={isSending}
            >
              <Send size={16} />
              <span>{isSending ? 'Đang gửi broadcast...' : 'Bắn Thông Báo Ngay'}</span>
            </button>
          </form>
        </div>

        {/* Live Phone Mockup Preview */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '18px', width: '100%' }}>
            Xem Trước Trên Điện Thoại (Live Preview)
          </h3>

          <div
            style={{
              width: '320px',
              minHeight: '420px',
              backgroundColor: '#000000',
              borderRadius: '36px',
              border: '4px solid #2a3144',
              padding: '16px 14px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Dynamic Island Notch */}
            <div
              style={{
                width: '90px',
                height: '18px',
                backgroundColor: '#111',
                borderRadius: '12px',
                margin: '0 auto 20px',
              }}
            />

            {/* Lockscreen Notification Card */}
            <div
              style={{
                backgroundColor: 'rgba(30, 35, 48, 0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '5px',
                      background: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#fff',
                    }}
                  >
                    C
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#fff' }}>CINESTREAM</span>
                </div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Vừa xong</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedMovie?.thumb_url || selectedMovie?.poster_url ? (
                  <img
                    src={selectedMovie.thumb_url || selectedMovie.poster_url}
                    alt="Movie Thumb"
                    style={{
                      width: '46px',
                      height: '62px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  />
                ) : null}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {title || 'Tiêu đề thông báo mẫu...'}
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {message || 'Nội dung thông báo sẽ hiển thị trực quan ở đây khi bạn nhập vào form bên cạnh.'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '10.5px',
                  color: 'var(--primary)',
                }}
              >
                <ExternalLink size={11} />
                <span>Chuyển hướng: {actionRoute}</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', paddingBottom: '8px' }}>
              Màn hình khóa iOS / Android (Mobile App)
            </div>
          </div>
        </div>
      </div>

      {/* Lịch Sử Thông Báo Đã Gửi */}
      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Lịch Sử Thông Báo Đã Bắn ({notifications.length})
          </h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tiêu Đề & Nội Dung</th>
              <th>Loại & Phim Gốc</th>
              <th>Đối Tượng</th>
              <th>Đích Đến (Deep Link)</th>
              <th>Thời Gian Gửi</th>
              <th>Lượt Đã Đọc</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Chưa có thông báo nào được gửi.
                </td>
              </tr>
            ) : (
              notifications.map((notif) => (
                <tr key={notif.id}>
                  <td>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {notif.image && (
                        <img
                          src={notif.image}
                          alt=""
                          style={{ width: '32px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '13.5px' }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '340px' }}>
                          {notif.message}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="badge badge-info" style={{ alignSelf: 'flex-start' }}>
                        {notif.type.toUpperCase()}
                      </span>
                      {notif.movieName && (
                        <span style={{ fontSize: '11px', color: 'var(--primary)' }}>
                          🎬 {notif.movieName}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-neutral">
                      {notif.targetAudience === 'all'
                        ? 'Tất cả'
                        : notif.targetAudience === 'vip'
                        ? 'Chỉ VIP ⭐'
                        : 'Free'}
                    </span>
                  </td>

                  <td>
                    <code style={{ fontSize: '11.5px', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {notif.actionRoute}
                    </code>
                  </td>

                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {notif.sentAt}
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>
                      {notif.readCount?.toLocaleString('vi-VN') || 0}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '11.5px' }}>
                      {' '}/ {(notif.totalSent || 0).toLocaleString('vi-VN')}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-icon"
                      style={{ color: '#ef4444' }}
                      title="Xóa thông báo"
                      onClick={() => handleDeleteNotification(notif.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
