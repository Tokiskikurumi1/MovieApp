import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Tự động lấy IP máy chủ từ kết nối Expo Bundler, fallback về IP Wi-Fi hiện tại: 192.168.159.195
const bundlerHost = Constants.expoConfig?.hostUri;
const autoDetectedIp = bundlerHost ? bundlerHost.split(':')[0] : null;

export const COMPUTER_IP = autoDetectedIp || '192.168.159.195';

export const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${COMPUTER_IP}:5000/api`;

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

async function fetchJson<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi kết nối máy chủ');
    }
    return data;
  } catch (error: any) {
    console.warn(`[API] ${endpoint} error:`, error.message);
    throw error;
  }
}

export const MovieAPI = {
  // 1. Phim Nổi bật (Banner Slider Trang chủ)
  getFeatured: () => fetchJson('/movies/featured'),

  // 2. Phim Thịnh hành (Top 10 Trending)
  getTrending: () => fetchJson('/movies/trending'),

  // 3. Phim Mới ra mắt
  getNewReleases: () => fetchJson('/movies/new-releases'),

  // 4. Tiếp tục xem (Continue Watching)
  getContinueWatching: () => fetchJson('/movies/continue-watching'),

  // 5. Danh sách thể loại
  getCategories: () => fetchJson('/movies/categories'),

  // 6. Tìm kiếm và lọc phim
  getMovies: (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    type?: string;
    year?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.type) query.append('type', params.type);
    if (params.year) query.append('year', String(params.year));
    return fetchJson(`/movies?${query.toString()}`);
  },

  // 7. Chi tiết phim và tập
  getMovieDetail: (idOrSlug: string) => fetchJson(`/movies/${idOrSlug}`),
};

export const UserAPI = {
  // Yêu thích
  getFavorites: () => fetchJson('/user/favorites'),
  toggleFavorite: (movieIdOrSlug: string) =>
    fetchJson('/user/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ movieIdOrSlug }),
    }),

  // Lưu tiến độ xem
  saveWatchProgress: (data: {
    movieIdOrSlug: string;
    episodeId?: number;
    progress: number;
    durationLeft?: string;
  }) =>
    fetchJson('/user/watch-progress', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Bình luận
  getComments: (movieIdOrSlug: string) => fetchJson(`/user/movies/${movieIdOrSlug}/comments`),
  postComment: (movieIdOrSlug: string, content: string, parentId?: number) =>
    fetchJson('/user/comments', {
      method: 'POST',
      body: JSON.stringify({ movieIdOrSlug, content, parentId }),
    }),
  toggleLikeComment: (commentId: string | number) =>
    fetchJson(`/user/comments/${commentId}/like`, { method: 'POST' }),
};

export const AuthAPI = {
  login: (account: string, pass: string) =>
    fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ account, password: pass }),
    }),
  register: (fullName: string, phone: string, email: string, pass: string) =>
    fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, phone, email, password: pass }),
    }),
  getMe: () => fetchJson('/auth/me'),
};
