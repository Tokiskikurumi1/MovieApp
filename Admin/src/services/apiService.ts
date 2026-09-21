// ==============================================================================
// CINESTREAM ADMIN API SERVICE (Dành cho Admin Web Dashboard)
// ==============================================================================

export const ADMIN_API_BASE_URL = 'http://localhost:5000/api';

async function fetchAdminJson<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${ADMIN_API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('cinestream_admin_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Lỗi kết nối máy chủ quản trị');
  }
  return data;
}

export const AdminAPI = {
  // Thống kê Dashboard
  getStats: () => fetchAdminJson('/admin/dashboard-stats'),

  // Quản lý phim
  getMovies: (params: { page?: number; limit?: number; search?: string; genre?: string; isVip?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);
    if (params.genre) query.append('genre', params.genre);
    if (params.isVip) query.append('isVip', params.isVip);
    if (params.status) query.append('status', params.status);
    return fetchAdminJson(`/admin/movies?${query.toString()}`);
  },
  deleteMovie: (id: string | number) => fetchAdminJson(`/admin/movies/${id}`, { method: 'DELETE' }),

  // Quản lý người dùng
  getUsers: () => fetchAdminJson('/admin/users'),
  toggleBanUser: (id: string | number) => fetchAdminJson(`/admin/users/${id}/ban`, { method: 'PUT' }),
  updateVipUser: (id: string | number, vipTier: string) =>
    fetchAdminJson(`/admin/users/${id}/vip`, {
      method: 'PUT',
      body: JSON.stringify({ vipTier }),
    }),

  // Quản lý bình luận
  getComments: () => fetchAdminJson('/admin/comments'),
  updateCommentStatus: (id: string | number, status: 'approved' | 'pending' | 'hidden') =>
    fetchAdminJson(`/admin/comments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Kích hoạt cào KKPhim
  triggerCrawler: (fromPage = 1, toPage = 1, slug?: string) =>
    fetchAdminJson('/admin/crawler/run', {
      method: 'POST',
      body: JSON.stringify({ fromPage, toPage, slug }),
    }),
};
