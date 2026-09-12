import React, { useState } from 'react';
import { Search, Bell, Plus, ShieldCheck } from 'lucide-react';
import type { AdminUser } from '../../services/authService';
import './Header.css';

interface HeaderProps {
  currentUser: AdminUser | null;
  onOpenAddMovieModal?: () => void;
  onSearchGlobal?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAddMovieModal,
  onSearchGlobal,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchGlobal) {
      onSearchGlobal(e.target.value);
    }
  };

  return (
    <header className="admin-header">
      {/* Search and Server Live Status */}
      <div className="header-left">
        <div className="header-search-bar">
          <Search size={16} />
          <input
            type="text"
            className="header-search-input"
            placeholder="Tìm kiếm phim, người dùng, mã đơn..."
            value={searchVal}
            onChange={handleSearchChange}
          />
        </div>

        <div className="server-status-badge">
          <div className="status-dot" />
          <span>CDN Streaming Server: 99.9% Online</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="header-right">
        {onOpenAddMovieModal && (
          <button className="btn btn-primary" onClick={onOpenAddMovieModal}>
            <Plus size={16} />
            <span>Thêm Phim Mới</span>
          </button>
        )}

        <button
          className="header-action-btn"
          title="Thông báo hệ thống"
          onClick={() => {
            setHasNewNotifications(false);
            alert('Thông báo: Có 1 đơn nạp VIP 1 Năm vừa thành công và 1 Ticket hỗ trợ mới.');
          }}
        >
          <Bell size={18} />
          {hasNewNotifications && <div className="header-badge-dot" />}
        </button>

        {currentUser && (
          <div className="header-avatar-btn">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="header-avatar-img"
            />
            <span className="header-admin-name">{currentUser.name}</span>
            <ShieldCheck size={14} color="var(--primary)" />
          </div>
        )}
      </div>
    </header>
  );
};
