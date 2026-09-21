-- ==============================================================================
-- SCHEMA CƠ SỞ DỮ LIỆU CINESTREAM (Tương thích MySQL 8.x / 9.x)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS movie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE movie_db;

-- 1. Bảng Phim (movies)
CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id VARCHAR(100) UNIQUE NULL COMMENT 'ID gốc từ KKPhim (_id)',
    name VARCHAR(255) NOT NULL COMMENT 'Tên phim tiếng Việt',
    origin_name VARCHAR(255) NULL COMMENT 'Tên phim gốc (tiếng Anh / bản xứ)',
    slug VARCHAR(255) NOT NULL UNIQUE COMMENT 'Slug định danh URL duy nhất',
    content LONGTEXT NULL COMMENT 'Nội dung tóm tắt phim',
    type VARCHAR(50) DEFAULT 'single' COMMENT 'single (phim lẻ), series (phim bộ), hoathinh, tvshows',
    status VARCHAR(50) DEFAULT 'completed' COMMENT 'completed (hoàn thành), ongoing (đang chiếu), trailer',
    thumb_url VARCHAR(500) NULL COMMENT 'URL ảnh thumbnail dọc',
    poster_url VARCHAR(500) NULL COMMENT 'URL ảnh poster ngang / banner',
    trailer_url VARCHAR(500) NULL COMMENT 'URL trailer youtube',
    time VARCHAR(100) NULL COMMENT 'Thời lượng phim (ví dụ: 45 phút/tập, 120 phút)',
    episode_current VARCHAR(100) NULL COMMENT 'Tập phim hiện tại (ví dụ: Tập 12, Full HD)',
    episode_total VARCHAR(100) NULL COMMENT 'Tổng số tập (ví dụ: 30 tập)',
    quality VARCHAR(50) DEFAULT 'HD' COMMENT 'Chất lượng (HD, FHD, CAM, 4K HDR)',
    lang VARCHAR(100) DEFAULT 'Vietsub' COMMENT 'Ngôn ngữ (Vietsub, Thuyết minh, Lồng tiếng)',
    notify VARCHAR(255) NULL COMMENT 'Thông báo cập nhật',
    showtimes VARCHAR(255) NULL COMMENT 'Lịch chiếu',
    year INT NULL COMMENT 'Năm phát hành',
    rating DECIMAL(3, 1) DEFAULT 8.5 COMMENT 'Điểm đánh giá',
    vote_count INT DEFAULT 120 COMMENT 'Lượt bình chọn',
    is_vip BOOLEAN DEFAULT FALSE COMMENT 'Phim độc quyền dành riêng cho tài khoản VIP',
    view_count INT DEFAULT 0 COMMENT 'Lượt xem trên hệ thống',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_year (year),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Thể loại (categories)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Liên kết Phim - Thể loại (movie_categories)
CREATE TABLE IF NOT EXISTS movie_categories (
    movie_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (movie_id, category_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Quốc gia (countries)
CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Liên kết Phim - Quốc gia (movie_countries)
CREATE TABLE IF NOT EXISTS movie_countries (
    movie_id INT NOT NULL,
    country_id INT NOT NULL,
    PRIMARY KEY (movie_id, country_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Tập phim (episodes)
CREATE TABLE IF NOT EXISTS episodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    server_name VARCHAR(100) NOT NULL DEFAULT 'Server #1' COMMENT 'Tên server phát (ví dụ: #Hà Nội, Vietsub...)',
    name VARCHAR(100) NOT NULL COMMENT 'Tên tập (ví dụ: Tập 01, Tập 02, Full)',
    slug VARCHAR(100) NOT NULL COMMENT 'Slug tập (ví dụ: tap-01, tap-02)',
    filename VARCHAR(255) NULL COMMENT 'Tên file gốc',
    link_embed TEXT NULL COMMENT 'Link iframe player',
    link_m3u8 TEXT NULL COMMENT 'Link direct HLS stream (.m3u8)',
    is_vip BOOLEAN DEFAULT FALSE COMMENT 'Tập phim khóa VIP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_movie_server_ep (movie_id, server_name, slug),
    INDEX idx_movie_id (movie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng Người dùng (users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NULL,
    phone VARCHAR(20) UNIQUE NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    role ENUM('admin', 'moderator', 'user') DEFAULT 'user',
    vip_tier ENUM('Free', 'VIP Standard', 'VIP 4K') DEFAULT 'Free',
    vip_expiry DATETIME NULL,
    total_watched_hours DECIMAL(8, 2) DEFAULT 0.00,
    status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_vip (vip_tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng Thiết bị của Người dùng (user_devices)
CREATE TABLE IF NOT EXISTS user_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_name VARCHAR(150) NOT NULL,
    device_type ENUM('mobile', 'desktop', 'tv') DEFAULT 'mobile',
    ip VARCHAR(50) NULL,
    location VARCHAR(150) DEFAULT 'Việt Nam',
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng Lịch sử xem / Tiếp tục xem (watch_history)
CREATE TABLE IF NOT EXISTS watch_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    episode_id INT NULL,
    progress DECIMAL(5, 4) DEFAULT 0.0000 COMMENT 'Tỉ lệ xem từ 0.00 đến 1.00 (ví dụ 0.68 = 68%)',
    duration_left VARCHAR(50) NULL COMMENT 'Thời gian còn lại (ví dụ: 42 phút còn lại)',
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_movie (user_id, movie_id),
    INDEX idx_user_history (user_id, last_watched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bảng Phim Yêu thích (favorites)
CREATE TABLE IF NOT EXISTS favorites (
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Bảng Bình luận (comments) - Hỗ trợ bình luận phân cấp kiểu Facebook
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT NULL COMMENT 'Nếu là phản hồi (reply) thì trỏ vào ID bình luận cha',
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    status ENUM('approved', 'pending', 'hidden') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_movie_parent (movie_id, parent_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Bảng Thích bình luận (comment_likes)
CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Bảng Giao dịch / Nạp VIP (transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    package_id ENUM('1m', '6m', '1y') DEFAULT '1m',
    package_name VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method ENUM('MoMo', 'VietQR', 'ZaloPay', 'Visa/Mastercard') NOT NULL,
    status ENUM('success', 'pending', 'refunded', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_tx (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Bảng Thông báo đẩy (notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('movie', 'vip', 'promo', 'system') DEFAULT 'system',
    target_audience ENUM('all', 'vip', 'free') DEFAULT 'all',
    action_route VARCHAR(255) DEFAULT '/(tabs)',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_count INT DEFAULT 0,
    total_sent INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Bảng Phiếu hỗ trợ người dùng (support_tickets)
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Bảng Phản hồi phiếu hỗ trợ (ticket_replies)
CREATE TABLE IF NOT EXISTS ticket_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_type ENUM('admin', 'user') NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- TẠO SẴN DỮ LIỆU MẪU BAN ĐẦU (SEED USERS ĐỒNG BỘ VỚI FRONTEND & ADMIN)
-- ==============================================================================

-- 1. Tài khoản Quản trị Admin (admin@cinestream.com / admin123)
INSERT INTO users (full_name, email, phone, password_hash, role, vip_tier, status)
VALUES ('Admin CINESTREAM', 'admin@cinestream.com', '0900000001', 'admin123', 'admin', 'VIP 4K', 'active')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 2. Tài khoản Khách hàng mẫu trên Mobile App (kurumi124@gmail.com / 0987654321 / Kurumi1234@)
INSERT INTO users (full_name, email, phone, password_hash, role, vip_tier, status)
VALUES ('Kurumi Tokisaki', 'kurumi124@gmail.com', '0987654321', 'Kurumi1234@', 'user', 'VIP 4K', 'active')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 3. Thêm thiết bị mẫu cho tài khoản test
INSERT INTO user_devices (user_id, device_name, device_type, ip, location)
SELECT id, 'iPhone 15 Pro Max', 'mobile', '118.69.182.10', 'Hà Nội, VN'
FROM users WHERE email = 'kurumi124@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE device_name = VALUES(device_name);
