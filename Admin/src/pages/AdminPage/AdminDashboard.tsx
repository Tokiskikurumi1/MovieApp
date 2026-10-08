import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Film,
  CreditCard,
  Eye,
  ShieldCheck,
  Star,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import { AdminAPI } from '../../services/apiService';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    AdminAPI.getStats()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => console.warn('Lỗi lấy thống kê admin:', err));
  }, []);

  const stats = data?.stats || {
    totalRevenueMonth: 0,
    totalRevenue: 0,
    totalViews: 0,
    activeVipUsers: 0,
    totalUsers: 0,
    totalMovies: 0,
    totalEpisodes: 0,
    viewsGrowthPercent: '+12.5%',
    vipGrowthPercent: '+8.3%',
    revenueGrowthPercent: '+15.2%',
  };

  const revenueChart: Array<{ day: string; date: string; revenue: number }> =
    data?.revenueChart || [];
  const maxRevenue = Math.max(1, ...(revenueChart.map((d) => d.revenue) || [1]));

  const genreDistribution: Array<{ name: string; count: number; percentage: number; color: string }> =
    data?.genreDistribution || [];

  const topMovies: any[] = data?.topMovies || [];
  const recentTransactions: any[] = data?.recentTransactions || [];

  return (
    <div className="admin-dashboard-page">
      {/* Page Title */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <TrendingUp size={24} color="var(--primary)" />
            Dashboard & Thống Kê Tổng Quan
          </h2>
          <p className="page-subtitle">
            Cập nhật tình hình tăng trưởng, doanh thu và lưu lượng xem phim theo thời gian thực từ Database
          </p>
        </div>
        {/* <div className="badge badge-success" style={{ padding: '6px 14px', fontSize: '13px' }}>
          <Sparkles size={14} /> Dữ liệu MySQL thời gian thực
        </div> */}
      </div>

      {/* KPI Cards 4 Cột */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Doanh thu */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
              DOANH THU THÁNG NÀY
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 51, 75, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <CreditCard size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '10px 0 4px' }}>
            {stats.totalRevenueMonth.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> {stats.revenueGrowthPercent}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>tổng: {stats.totalRevenue.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* Lượt xem */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
              TỔNG LƯỢT XEM HỆ THỐNG
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--info)',
              }}
            >
              <Eye size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '10px 0 4px' }}>
            {stats.totalViews.toLocaleString('vi-VN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> {stats.viewsGrowthPercent}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>tổng lượt xem phim</span>
          </div>
        </div>

        {/* Hội viên VIP */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
              HỘI VIÊN VIP ĐANG HOẠT ĐỘNG
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 215, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffd700',
              }}
            >
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '10px 0 4px' }}>
            {stats.activeVipUsers.toLocaleString('vi-VN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ color: '#ffd700', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <Users size={14} style={{ marginRight: '3px' }} /> {stats.totalUsers}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>tổng người dùng đăng ký</span>
          </div>
        </div>

        {/* Tổng số phim & tập đã cào */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
              TỔNG SỐ PHIM & TẬP ĐÃ CÀO
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <Film size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '10px 0 4px' }}>
            {Number(stats.totalMovies || 0).toLocaleString('vi-VN')} Phim ({Number(stats.totalEpisodes || 0).toLocaleString('vi-VN')} Tập)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <div className="status-dot" />
            <span style={{ color: '#10b981', fontWeight: 600 }}>Đồng bộ tự động KKPhim</span>
          </div>
        </div>
      </div>

      {/* Biểu Đồ Doanh Thu & Cơ Cấu Thể Loại (2 Cột) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        {/* Biểu Đồ Cột Doanh Thu 7 Ngày */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                Doanh Thu 7 Ngày Gần Nhất
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Thống kê các đơn mua gói VIP qua MoMo, VietQR, ZaloPay & Thẻ từ Database
              </p>
            </div>
            <span className="badge badge-info">7 Ngày qua</span>
          </div>

          {/* Canvas-like CSS Bar Chart */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '180px',
              paddingTop: '20px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {revenueChart.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                Chưa có dữ liệu doanh thu 7 ngày qua.
              </div>
            ) : (
              revenueChart.map((item, idx) => {
                const heightPercent = maxRevenue > 0 && item.revenue > 0
                  ? Math.max(10, (item.revenue / maxRevenue) * 100)
                  : 4;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 1,
                    }}
                  >
                    <div
                      title={`${item.day}: ${item.revenue.toLocaleString('vi-VN')} đ`}
                      style={{
                        width: '28px',
                        height: `${heightPercent}%`,
                        background:
                          item.revenue > 0
                            ? 'linear-gradient(180deg, var(--primary) 0%, rgba(255, 51, 75, 0.4) 100%)'
                            : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px 6px 2px 2px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {item.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Phân Bổ Thể Loại Phim */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                Tỷ Lệ Thể Loại Phim Trong Kho
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Thống kê số lượng phim theo danh mục trong cơ sở dữ liệu
              </p>
            </div>
            <span className="badge badge-neutral">Top 4</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {genreDistribution.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                Đang cập nhật thể loại...
              </div>
            ) : (
              genreDistribution.map((genre, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{genre.name}</span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                      {genre.percentage}% ({genre.count} phim)
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${genre.percentage}%`,
                        height: '100%',
                        backgroundColor: genre.color,
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Phim & Giao Dịch Gần Nhất (2 Cột) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Top Phim Hot */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
              Top 5 Phim Lượt Xem Cao Nhất
            </h3>
            <Film size={18} color="var(--primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topMovies.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                Chưa có dữ liệu lượt xem phim.
              </div>
            ) : (
              topMovies.map((m, idx) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: idx === 0 ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <img
                    src={m.poster}
                    alt={m.title}
                    style={{ width: '38px', height: '52px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span>{m.quality || '4K HDR'}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', color: '#ffd700' }}>
                        <Star size={11} fill="#ffd700" style={{ marginRight: '2px' }} /> {m.rating}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {Number(m.views || 0).toLocaleString('vi-VN')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>lượt xem</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Giao dịch mới nhất */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
              Giao Dịch Nạp VIP Mới Nhất
            </h3>
            <CreditCard size={18} color="#ffd700" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                Chưa có giao dịch nạp VIP nào.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={tx.user?.avatar || 'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_avatar.png'}
                      alt={tx.user?.name || 'User'}
                      style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                        {tx.user?.name || 'Khách hàng'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {tx.packageName} • {tx.paymentMethod}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                      +{Number(tx.amount || 0).toLocaleString('vi-VN')} đ
                    </div>
                    <span
                      className={`badge ${
                        tx.status === 'success' ? 'badge-success' : tx.status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`}
                      style={{ fontSize: '10.5px' }}
                    >
                      {tx.status === 'success' ? 'Thành công' : tx.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

