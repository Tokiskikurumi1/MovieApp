import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboard } from '../pages/AdminPage/AdminDashboard';
import { MovieManagement } from '../pages/AdminPage/MovieManagement';
import { UserManagement } from '../pages/AdminPage/UserManagement';
import { BillingManagement } from '../pages/AdminPage/BillingManagement';
import { CommentModeration } from '../pages/AdminPage/CommentModeration';
import { NotificationCenter } from '../pages/AdminPage/NotificationCenter';
import { SupportTickets } from '../pages/AdminPage/SupportTickets';
import { authService } from '../services/authService';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Portal Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="movies" element={<MovieManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="comments" element={<CommentModeration />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="tickets" element={<SupportTickets />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={
          authService.isAuthenticated() ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};
