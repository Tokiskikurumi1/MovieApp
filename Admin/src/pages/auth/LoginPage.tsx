import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@cinestream.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu quản trị!');
      return;
    }

    try {
      setIsLoading(true);
      await authService.login(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@cinestream.com');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="login-page-container">
      <div className="login-backdrop" />
      <div className="login-grid-overlay" />

      <div className="login-card">
        {/* Header Branding */}
        <div className="login-header">
          <div className="login-brand-row">
            <div className="brand-icon-box">
              <Film size={22} />
            </div>
            <h1 className="brand-title">
              CINE<span>STREAM</span>
            </h1>
          </div>
          <div>
            <span className="admin-portal-badge">
              <ShieldCheck size={14} /> PORTAL QUẢN TRỊ
            </span>
          </div>
          <p className="login-subheading">
            Đăng nhập hệ thống điều hành ứng dụng CINESTREAM Cinema
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="login-input-group">
            <label className="form-label" htmlFor="email-input">
              Tài Khoản Quản Trị / Email
            </label>
            <div className="login-input-wrapper">
              <input
                id="email-input"
                type="email"
                className="login-input-field"
                placeholder="admin@cinestream.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Mail size={18} className="login-input-icon" />
            </div>
          </div>

          {/* Password Input */}
          <div className="login-input-group">
            <label className="form-label" htmlFor="password-input">
              Mật Khẩu Quản Trị
            </label>
            <div className="login-input-wrapper">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="login-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Lock size={18} className="login-input-icon" />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="login-options-row">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Ghi nhớ phiên đăng nhập</span>
            </label>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert('Vui lòng liên hệ Trưởng bộ phận Kỹ thuật Hệ thống để cấp lại mật khẩu bảo mật.');
              }}
              className="forgot-link"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner" />
                <span>Đang xác thực hệ thống...</span>
              </>
            ) : (
              <>
                <span>Đăng Nhập Quản Trị</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill Box */}
        <div className="demo-quickfill-box">
          <div className="demo-credentials">
            <div>Tài khoản thử nghiệm:</div>
            <strong>admin@cinestream.com</strong> / <strong>admin123</strong>
          </div>
          <button type="button" className="quickfill-btn" onClick={handleQuickFill}>
            Điền nhanh
          </button>
        </div>

        {/* Footer Note */}
        <div className="login-footer-note">
          <ShieldCheck size={13} />
          <span>Hệ thống bảo mật 256-bit SSL • Toàn quyền kiểm soát Movie App</span>
        </div>
      </div>
    </div>
  );
};
