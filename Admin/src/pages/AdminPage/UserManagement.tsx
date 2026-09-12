import React, { useState } from 'react';
import {
  Users,
  Search,
  Smartphone,
  Ban,
  CheckCircle,
  Crown,
  X,
  Laptop,
  Tv,
} from 'lucide-react';
import { type User, INITIAL_USERS } from '../../services/mockData';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [vipFilter, setVipFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [selectedUserForVip, setSelectedUserForVip] = useState<User | null>(null);
  const [vipTierChoice, setVipTierChoice] = useState<'VIP 4K' | 'VIP Standard' | 'Free'>('VIP 4K');
  const [selectedUserForDevices, setSelectedUserForDevices] = useState<User | null>(null);

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchVip =
      vipFilter === 'ALL' ||
      (vipFilter === 'VIP' && u.vipTier.includes('VIP')) ||
      (vipFilter === 'FREE' && u.vipTier === 'Free');
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchSearch && matchVip && matchStatus;
  });

  // Toggle Ban / Active
  const handleToggleBan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'banned' ? 'active' : 'banned';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // Save VIP Tier
  const handleSaveVipTier = () => {
    if (!selectedUserForVip) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === selectedUserForVip.id) {
          return {
            ...u,
            vipTier: vipTierChoice,
            vipExpiry: vipTierChoice === 'Free' ? undefined : '2027-12-31',
          };
        }
        return u;
      })
    );
    setSelectedUserForVip(null);
  };

  // Terminate Device Session
  const handleTerminateDevice = (deviceId: string) => {
    if (!selectedUserForDevices) return;
    const updatedDevices = selectedUserForDevices.devices.filter((d) => d.id !== deviceId);
    const updatedUser: User = { ...selectedUserForDevices, devices: updatedDevices };
    setSelectedUserForDevices(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
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
            Theo dõi danh sách hội viên, cấp quyền VIP 4K, quản lý phiên thiết bị và trạng thái hoạt động
          </p>
        </div>
        <div className="badge badge-vip" style={{ padding: '6px 14px' }}>
          <Crown size={14} /> Tổng: {users.length} tài khoản
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
            style={{ width: '170px' }}
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
          >
            <option value="ALL">Tất cả gói VIP</option>
            <option value="VIP">Chỉ hội viên VIP</option>
            <option value="FREE">Tài khoản Miễn phí</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="banned">Bị tạm khóa</option>
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
              <th>Thiết Bị Đang Dùng</th>
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
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: user.role === 'admin' ? '2px solid var(--primary)' : '1px solid var(--border)',
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

                  <td>
                    {user.vipTier === 'VIP 4K' ? (
                      <div>
                        <span className="badge badge-vip">VIP 4K Ultra HD</span>
                        <div style={{ fontSize: '11px', color: '#ffd700', marginTop: '2px' }}>
                          Hạn: {user.vipExpiry}
                        </div>
                      </div>
                    ) : user.vipTier === 'VIP Standard' ? (
                      <span className="badge badge-info">VIP Standard</span>
                    ) : (
                      <span className="badge badge-neutral">Miễn phí (Free)</span>
                    )}
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.totalWatchedHours}h
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => setSelectedUserForDevices(user)}
                    >
                      <Smartphone size={14} />
                      <span>{user.devices?.length || 0} thiết bị</span>
                    </button>
                  </td>

                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {user.lastActive}
                  </td>

                  <td>
                    {user.status === 'active' ? (
                      <span className="badge badge-success">Hoạt động</span>
                    ) : (
                      <span className="badge badge-danger">Đã khóa</span>
                    )}
                  </td>

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
                          style={{ color: user.status === 'banned' ? '#10b981' : '#ef4444' }}
                          title={user.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          onClick={() => handleToggleBan(user.id)}
                        >
                          {user.status === 'banned' ? <CheckCircle size={15} /> : <Ban size={15} />}
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
              <h3 className="modal-title">Cập Nhật Gói VIP: {selectedUserForVip.fullName}</h3>
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
                  <option value="VIP 4K">Gói VIP 4K Ultra HD (Không giới hạn)</option>
                  <option value="VIP Standard">Gói VIP Tiêu Chuẩn 1080p</option>
                  <option value="Free">Tài Khoản Miễn Phí (Free)</option>
                </select>
              </div>

              {vipTierChoice !== 'Free' && (
                <div style={{ padding: '12px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.3)', marginTop: '10px' }}>
                  <div style={{ fontSize: '12.5px', color: '#ffd700', fontWeight: 600 }}>
                    ⭐ Đặc quyền VIP: Xem 4K HDR, Âm thanh Dolby Atmos, Không quảng cáo.
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

      {/* Modal Quản Lý Thiết Bị Đăng Nhập */}
      {selectedUserForDevices && (
        <div className="modal-overlay" onClick={() => setSelectedUserForDevices(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Thiết Bị Đăng Nhập: {selectedUserForDevices.fullName}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Quản lý các phiên đăng nhập đang hoạt động trên Mobile, TV và Web
                </p>
              </div>
              <button className="btn-icon" onClick={() => setSelectedUserForDevices(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {selectedUserForDevices.devices?.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                  Chưa có thiết bị nào đang hoạt động.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedUserForDevices.devices?.map((dev) => (
                    <div
                      key={dev.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                          }}
                        >
                          {dev.deviceType === 'desktop' ? (
                            <Laptop size={18} />
                          ) : dev.deviceType === 'tv' ? (
                            <Tv size={18} />
                          ) : (
                            <Smartphone size={18} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>
                            {dev.deviceName}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            IP: {dev.ip} • {dev.location}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-success" style={{ fontSize: '11px' }}>
                          {dev.lastActive}
                        </span>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '11.5px' }}
                          onClick={() => handleTerminateDevice(dev.id)}
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedUserForDevices(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
