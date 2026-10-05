import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Ban,
  CheckCircle,
  Crown,
  X,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { type User, INITIAL_USERS } from '../../services/mockData';
import { AdminAPI } from '../../services/apiService';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [vipFilter, setVipFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [selectedUserForVip, setSelectedUserForVip] = useState<User | null>(null);
  const [vipTierChoice, setVipTierChoice] = useState<'VIP 4K' | 'VIP Standard' | 'Free'>('VIP 4K');
  const [vipExpiryDays, setVipExpiryDays] = useState<number>(30);

  const loadUsers = () => {
    AdminAPI.getUsers()
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          const mapped: User[] = res.data.map((u: any) => ({
            id: String(u.id),
            fullName: u.fullName || u.full_name || 'Khách hàng',
            email: u.email || 'user@cinestream.vn',
            avatar: u.avatar || u.avatar_url || 'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_avatar.png',
            role: u.role || 'user',
            vipTier: (u.vipTier || (u.is_vip ? 'VIP 4K' : 'Free')) as 'VIP 4K' | 'VIP Standard' | 'Free',
            vipExpiry: u.vipExpiry
              ? (typeof u.vipExpiry === 'string' && u.vipExpiry.includes('T') ? new Date(u.vipExpiry).toLocaleDateString('vi-VN') : u.vipExpiry)
              : (u.vip_expires_at ? new Date(u.vip_expires_at).toLocaleDateString('vi-VN') : undefined),
            status: (u.status || (u.is_banned ? 'banned' : 'active')) as any,
            devices: [],
            totalWatchedHours: Number(u.totalWatchedHours || u.total_watched_hours || 0),
            createdAt: u.createdAt
              ? (typeof u.createdAt === 'string' && u.createdAt.includes('T') ? new Date(u.createdAt).toLocaleDateString('vi-VN') : u.createdAt)
              : (u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '2026-09-20'),
            lastActive: u.lastActive || 'Hôm nay',
          }));
          setUsers(mapped);
        }
      })
      .catch((err) => console.warn('Lỗi tải người dùng:', err));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchVip =
      vipFilter === 'ALL' ||
      (vipFilter === 'VIP' && (u.vipTier === 'VIP 4K' || u.vipTier === 'VIP Standard')) ||
      (vipFilter === 'VIP_4K' && u.vipTier === 'VIP 4K') ||
      (vipFilter === 'VIP_STD' && u.vipTier === 'VIP Standard') ||
      (vipFilter === 'FREE' && u.vipTier === 'Free');
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchSearch && matchVip && matchStatus;
  });

  // Toggle Ban / Active / Restore
  const handleToggleBan = (userId: string) => {
    AdminAPI.toggleBanUser(userId).catch((err) => console.warn('Lỗi ban/khôi phục user:', err));
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = (u.status === 'banned' || (u.status as any) === 'deleted') ? 'active' : 'banned';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // Save VIP Tier
  const handleSaveVipTier = () => {
    if (!selectedUserForVip) return;
    AdminAPI.updateVipUser(selectedUserForVip.id, vipTierChoice).catch((err) => console.warn('Lỗi cấp VIP:', err));
    
    // Tính ngày hết hạn hiển thị
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + vipExpiryDays);
    const expString = vipTierChoice === 'Free' ? 'Không có' : expDate.toLocaleDateString('vi-VN');

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === selectedUserForVip.id) {
          return {
            ...u,
            vipTier: vipTierChoice,
            vipExpiry: expString,
          };
        }
        return u;
      })
    );
    setSelectedUserForVip(null);
  };

  return (
    <div className="user-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Users size={24} color="var(--primary)" />
            Quản Lý Người Dùng & Gói VIP
          </h2>
          <p className="page-subtitle">
            Theo dõi danh sách hội viên, thời lượng xem phim tích lũy, cấp đặc quyền VIP và quản lý trạng thái tài khoản
          </p>
        </div>
        <div className="badge badge-vip" style={{ padding: '8px 16px', fontSize: '13px' }}>
          <Crown size={15} /> Tổng: {users.length} tài khoản
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar glass-panel" style={{ padding: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo tên người dùng, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          {/* VIP Filter */}
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
          >
            <option value="ALL">Tất cả gói thành viên</option>
            <option value="VIP">Tất cả VIP (4K & STD)</option>
            <option value="VIP_4K">VIP 4K Ultra HD</option>
            <option value="VIP_STD">VIP Tiêu Chuẩn</option>
            <option value="FREE">Tài khoản Miễn phí</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: '170px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="banned">Bị tạm khóa</option>
            <option value="deleted">Đã hủy / xóa</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Người Dùng</th>
              <th>Gói Thành Viên</th>
              <th>Thời Lượng Đã Xem</th>
              <th>Ngày Tham Gia</th>
              <th>Hoạt Động Gần Nhất</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  {/* Người Dùng */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: user.role === 'admin' ? '2px solid var(--primary)' : '1px solid var(--border)',
                          opacity: (user.status as any) === 'deleted' ? 0.6 : 1,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {user.fullName}
                          {user.role === 'admin' && (
                            <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 6px' }}>
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Gói Thành Viên */}
                  <td>
                    {user.vipTier === 'VIP 4K' ? (
                      <div>
                        <span className="badge badge-vip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Crown size={12} /> VIP 4K Ultra HD
                        </span>
                        <div style={{ fontSize: '11px', color: '#ffd700', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={11} /> Hạn: {user.vipExpiry || '30 ngày'}
                        </div>
                      </div>
                    ) : user.vipTier === 'VIP Standard' ? (
                      <div>
                        <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={12} /> VIP Standard
                        </span>
                        <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={11} /> Hạn: {user.vipExpiry || '30 ngày'}
                        </div>
                      </div>
                    ) : (
                      <span className="badge badge-neutral">Miễn phí (Free)</span>
                    )}
                  </td>

                  {/* Thời Lượng Đã Xem */}
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <Clock size={14} color="var(--primary)" />
                      <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>
                        {Number(user.totalWatchedHours || 0) > 0
                          ? `${Number(user.totalWatchedHours).toFixed(1).replace('.0', '')} giờ`
                          : '0 giờ'}
                      </span>
                    </div>
                  </td>

                  {/* Ngày Tham Gia */}
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {user.createdAt}
                  </td>

                  {/* Hoạt Động Gần Nhất */}
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {user.lastActive}
                  </td>

                  {/* Trạng Thái */}
                  <td>
                    {user.status === 'active' ? (
                      <span className="badge badge-success">Hoạt động</span>
                    ) : (user.status as any) === 'deleted' ? (
                      <span className="badge badge-neutral" style={{ color: '#9ca3af', border: '1px dashed rgba(255,255,255,0.2)' }}>
                        Đã xóa (Hủy)
                      </span>
                    ) : (
                      <span className="badge badge-danger">Đã khóa</span>
                    )}
                  </td>

                  {/* Thao Tác */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="btn-icon"
                        title="Cấp quyền / Đổi gói VIP"
                        onClick={() => {
                          setSelectedUserForVip(user);
                          setVipTierChoice(user.vipTier);
                        }}
                      >
                        <Crown size={15} color="#ffd700" />
                      </button>

                      {user.role !== 'admin' && (
                        <button
                          className="btn-icon"
                          style={{
                            color: user.status === 'active' ? '#ef4444' : '#10b981',
                          }}
                          title={
                            (user.status as any) === 'deleted'
                              ? 'Khôi phục tài khoản'
                              : user.status === 'banned'
                              ? 'Mở khóa tài khoản'
                              : 'Khóa tài khoản'
                          }
                          onClick={() => handleToggleBan(user.id)}
                        >
                          {user.status === 'active' ? <Ban size={15} /> : <CheckCircle size={15} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nâng Cấp VIP */}
      {selectedUserForVip && (
        <div className="modal-overlay" onClick={() => setSelectedUserForVip(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Cập Nhật Gói Hội Viên</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Tài khoản: <strong style={{ color: '#fff' }}>{selectedUserForVip.fullName}</strong> ({selectedUserForVip.email})
                </p>
              </div>
              <button className="btn-icon" onClick={() => setSelectedUserForVip(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Chọn Hạng Gói Cước</label>
                <select
                  className="form-select"
                  value={vipTierChoice}
                  onChange={(e) => setVipTierChoice(e.target.value as any)}
                >
                  <option value="VIP 4K">⭐ Gói VIP 4K Ultra HD (Không giới hạn, Dolby Atmos)</option>
                  <option value="VIP Standard">💎 Gói VIP Standard (Full HD 1080p)</option>
                  <option value="Free">👤 Tài Khoản Miễn Phí (Free)</option>
                </select>
              </div>

              {vipTierChoice !== 'Free' && (
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label className="form-label">Thời Hạn Gói</label>
                  <select
                    className="form-select"
                    value={vipExpiryDays}
                    onChange={(e) => setVipExpiryDays(Number(e.target.value))}
                  >
                    <option value={30}>1 Tháng (30 Ngày)</option>
                    <option value={90}>3 Tháng (90 Ngày)</option>
                    <option value={180}>6 Tháng (180 Ngày)</option>
                    <option value={365}>1 Năm (365 Ngày)</option>
                    <option value={3650}>Vĩnh viễn (Trọn đời)</option>
                  </select>
                </div>
              )}

              {vipTierChoice !== 'Free' && (
                <div style={{ padding: '12px', background: 'rgba(255, 215, 0, 0.08)', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.25)', marginTop: '14px' }}>
                  <div style={{ fontSize: '12.5px', color: '#ffd700', fontWeight: 600 }}>
                    ✨ Đặc quyền VIP: Xem phim 4K HDR, Âm thanh Dolby Atmos, Không quảng cáo, Tải ngoại tuyến.
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedUserForVip(null)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSaveVipTier}>
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

