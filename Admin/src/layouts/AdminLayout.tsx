import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Header } from '../components/Header/Header';
import { ConfirmModal } from '../components/UI/ConfirmModal';
import { authService, type AdminUser } from '../services/authService';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser] = useState<AdminUser | null>(authService.getStoredUser());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogoutConfirm = () => {
    authService.logout();
    setIsLogoutModalOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onOpenAddMovieModal={() => navigate('/admin/movies')}
        />

        {/* Page Content Outlet */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Xác Nhận Đăng Xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi trang Quản Trị CINESTREAM không?"
        confirmText="Đăng Xuất"
        cancelText="Ở Lại"
        isDanger={true}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};
