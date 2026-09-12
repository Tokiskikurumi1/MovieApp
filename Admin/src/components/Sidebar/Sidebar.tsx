import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Users,
  CreditCard,
  MessageSquareQuote,
  BellRing,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { AdminUser } from '../../services/authService';
import './Sidebar.css';

interface SidebarProps {
  currentUser: AdminUser | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogoutClick: () => void;
  pendingCommentsCount?: number;
  openTicketsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  collapsed,
  onToggleCollapse,
  onLogoutClick,
  pendingCommentsCount = 1,
  openTicketsCount = 2,
}) => {
  const menuItems = [
    {
      section: 'Tổng Quan',
      items: [
        {
          path: '/admin/dashboard',
          label: 'Dashboard & Thống Kê',
          icon: <LayoutDashboard size={20} className="nav-icon" />,
        },
      ],
    },
    {
      section: 'Nội Dung & Người Dùng',
      items: [
        {
          path: '/admin/movies',
          label: 'Quản Lý Phim & Tập',
          icon: <Film size={20} className="nav-icon" />,
        },
        {
          path: '/admin/users',
          label: 'Quản Lý Người Dùng & VIP',
          icon: <Users size={20} className="nav-icon" />,
        },
        {
          path: '/admin/billing',
          label: 'Lịch Sử Giao Dịch & Gói',
          icon: <CreditCard size={20} className="nav-icon" />,
        },
      ],
    },
    {
      section: 'Tương Tác & Chăm Sóc',
      items: [
        {
          path: '/admin/comments',
          label: 'Kiểm Duyệt Bình Luận',
          icon: <MessageSquareQuote size={20} className="nav-icon" />,
          badge: pendingCommentsCount > 0 ? pendingCommentsCount : null,
          badgeType: 'warning',
        },
        {
          path: '/admin/notifications',
          label: 'Gửi Thông Báo Push',
          icon: <BellRing size={20} className="nav-icon" />,
        },
        {
          path: '/admin/tickets',
          label: 'Hỗ Trợ & Khiếu Nại',
          icon: <HelpCircle size={20} className="nav-icon" />,
          badge: openTicketsCount > 0 ? openTicketsCount : null,
          badgeType: 'danger',
        },
      ],
    },
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <NavLink to="/admin/dashboard" className="sidebar-logo-link">
          <div className="sidebar-logo-icon">
            <Film size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              CINE<span>STREAM</span>
            </div>
          )}
        </NavLink>
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="sidebar-nav">
        {menuItems.map((group, idx) => (
          <div key={idx} className="nav-group">
            {!collapsed && <div className="nav-section-title">{group.section}</div>}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span className="nav-text">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`nav-badge ${item.badgeType}`}>{item.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer User Info & Logout */}
      <div className="sidebar-footer">
        {!collapsed && currentUser && (
          <div className="admin-profile-box">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="admin-avatar"
            />
            <div className="admin-info">
              <div className="admin-name">{currentUser.name}</div>
              <div className="admin-role">{currentUser.role}</div>
            </div>
          </div>
        )}
        <button
          className="logout-action-btn"
          onClick={onLogoutClick}
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut size={16} />
          {!collapsed && <span>Đăng Xuất</span>}
        </button>
      </div>
    </aside>
  );
};
