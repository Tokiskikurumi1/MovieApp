/**
 * Ảnh đại diện mặc định cao cấp dành cho người dùng chưa có avatar hoặc khi ảnh bị lỗi / link hỏng
 */
export const DEFAULT_AVATAR_URI =
  'https://res.cloudinary.com/lsydaklc/image/upload/v1790956054/cinestream_defaults/default_avatar.png';

/**
 * Kiểm tra và trả về URI avatar hợp lệ.
 * Tự động chuyển về DEFAULT_AVATAR_URI nếu URI rỗng hoặc là đường dẫn file cục bộ (file://, blob:)
 */
export function getValidAvatarUri(uri?: string | null): string {
  if (!uri || typeof uri !== 'string') return DEFAULT_AVATAR_URI;
  const trimmed = uri.trim();
  if (!trimmed) return DEFAULT_AVATAR_URI;

  // Nếu là đường dẫn cục bộ tạm thời từ phiên trước không thể tải trên thiết bị khác
  if (trimmed.startsWith('file://') || trimmed.startsWith('blob:')) {
    return DEFAULT_AVATAR_URI;
  }

  // Chuyển avatar mẫu Unsplash cũ sang avatar mặc định mới
  if (trimmed.includes('photo-1535713875002-d1d0cf377fde')) {
    return DEFAULT_AVATAR_URI;
  }

  // Nếu là URL hợp lệ trên internet (Cloudinary, Unsplash, CDN...)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Base64 Data URI
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  return DEFAULT_AVATAR_URI;
}
