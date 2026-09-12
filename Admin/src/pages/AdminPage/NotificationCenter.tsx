import React, { useState } from 'react';
import {
  BellRing,
  Send,
  Smartphone,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { type PushNotification, INITIAL_NOTIFICATIONS } from '../../services/mockData';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState<'movie' | 'vip' | 'promo' | 'system'>('movie');
  const [targetAudience, setTargetAudience] = useState<'all' | 'vip' | 'free'>('all');
  const [actionRoute, setActionRoute] = useState('/watch/movie-1');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const newNotification: PushNotification = {
        id: `notif-${Date.now()}`,
        title,
        message,
        type: notifType,
        targetAudience,
        actionRoute,
        sentAt: new Date().toLocaleString('vi-VN'),
        readCount: 0,
        totalSent: targetAudience === 'all' ? 3840 : targetAudience === 'vip' ? 1420 : 2420,
      };

      setNotifications([newNotification, ...notifications]);
      setIsSending(false);
      setSendSuccess(true);
      setTitle('');
      setMessage('');

      setTimeout(() => setSendSuccess(false), 4000);
    }, 600);
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
            Bắn thông báo trực tiếp tới điện thoại người dùng, thông báo phim mới ra mắt, khuyến mãi VIP
          </p>
        </div>
        <div className="badge badge-success" style={{ padding: '6px 14px' }}>
          <Smartphone size={14} /> Tích hợp Expo Push Server
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
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <span>Đã bắn thông báo thành công đến các thiết bị di động!</span>
            </div>
          )}

          <form onSubmit={handleSendPush}>
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
                  <option value="all">Tất cả người dùng (3.840)</option>
                  <option value="vip">Chỉ Hội Viên VIP (1.420)</option>
                  <option value="free">Chỉ Tài Khoản Free (2.420)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Đích Đến Khi Bấm Vào (Deep Link)</label>
              <select
                className="form-select"
                value={actionRoute}
                onChange={(e) => setActionRoute(e.target.value)}
              >
                <option value="/watch/movie-1">Trình phát phim: Deadpool & Wolverine</option>
                <option value="/watch/movie-2">Trình phát phim: Nông Dân Nhàn Nhã</option>
                <option value="/sub-layout/billing-subscription">Màn hình Nâng Cấp Gói VIP</option>
                <option value="/sub-layout/help-center">Trung Tâm Hỗ Trợ 24/7</option>
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
            Xem Trước Trên Điện Thoại (Preview)
          </h3>

          <div
            style={{
              width: '300px',
              height: '420px',
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
                backgroundColor: 'rgba(30, 35, 48, 0.9)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '12px 14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      background: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#fff',
                    }}
                  >
                    C
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>CINESTREAM</span>
                </div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Vừa xong</span>
              </div>

              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                {title || 'Tiêu đề thông báo mẫu...'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                {message || 'Nội dung thông báo sẽ hiển thị trực quan ở đây khi bạn nhập vào form bên cạnh.'}
              </div>
            </div>

            <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
              Màn hình khóa iOS / Android
            </div>
          </div>
        </div>
      </div>

      {/* Lịch Sử Thông Báo Đã Gửi */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tiêu Đề & Nội Dung</th>
              <th>Loại</th>
              <th>Đối Tượng</th>
              <th>Thời Gian Gửi</th>
              <th>Số Người Đã Xem</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notif) => (
              <tr key={notif.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '13.5px' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {notif.message}
                  </div>
                </td>

                <td>
                  <span className="badge badge-info">{notif.type.toUpperCase()}</span>
                </td>

                <td>
                  <span className="badge badge-neutral">
                    {notif.targetAudience === 'all'
                      ? 'Tất cả'
                      : notif.targetAudience === 'vip'
                      ? 'Chỉ VIP'
                      : 'Free'}
                  </span>
                </td>

                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {notif.sentAt}
                </td>

                <td>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>
                    {notif.readCount.toLocaleString('vi-VN')}
                  </span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '11.5px' }}>
                    {' '}/ {notif.totalSent.toLocaleString('vi-VN')}
                  </span>
                </td>

                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn-icon"
                    style={{ color: '#ef4444' }}
                    title="Xóa lịch sử"
                    onClick={() => setNotifications(notifications.filter((n) => n.id !== notif.id))}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
