export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Content Manager' | 'Moderator';
  avatar: string;
  lastLogin: string;
}

const STORAGE_KEY = 'cinestream_admin_auth';

const DEFAULT_ADMIN: AdminUser = {
  id: 'adm-01',
  name: 'Admin CINESTREAM',
  email: 'admin@cinestream.com',
  role: 'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  lastLogin: new Date().toLocaleString('vi-VN'),
};

export const authService = {
  getStoredUser(): AdminUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getStoredUser();
  },

  login(email: string, pass: string): Promise<AdminUser> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple demo authentication check
        if (
          (email === 'admin@cinestream.com' && pass === 'admin123') ||
          email.includes('@') && pass.length >= 6
        ) {
          const user: AdminUser = {
            ...DEFAULT_ADMIN,
            email,
            lastLogin: new Date().toLocaleString('vi-VN'),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Tài khoản hoặc mật khẩu không chính xác! (Gợi ý: admin@cinestream.com / admin123)'));
        }
      }, 700);
    });
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
