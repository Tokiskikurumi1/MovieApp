export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  views: number;
}

export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  synopsis: string;
  poster: string;
  banner: string;
  trailerUrl: string;
  rating: number;
  voteCount: number;
  year: number;
  quality: '4K HDR' | 'FHD 1080p' | 'HD';
  ageLimit: string;
  isVip: boolean;
  status: 'active' | 'draft' | 'archived';
  genres: string[];
  totalEpisodes: number;
  episodes: Episode[];
  views: number;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'user';
  vipTier: 'VIP 4K' | 'VIP Standard' | 'Free';
  vipExpiry?: string;
  totalWatchedHours: number;
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  lastActive: string;
  devices: {
    id: string;
    deviceName: string;
    deviceType: 'mobile' | 'desktop' | 'tv';
    ip: string;
    location: string;
    lastActive: string;
  }[];
}

export interface Transaction {
  id: string;
  orderCode: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  packageId: '1m' | '6m' | '1y';
  packageName: string;
  amount: number;
  paymentMethod: 'MoMo' | 'VietQR' | 'ZaloPay' | 'Visa/Mastercard';
  status: 'success' | 'pending' | 'refunded' | 'failed';
  createdAt: string;
}

export interface CommentItem {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isVip: boolean;
  };
  content: string;
  likes: number;
  replyCount: number;
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'movie' | 'vip' | 'promo' | 'system';
  targetAudience: 'all' | 'vip' | 'free';
  actionRoute: string;
  sentAt: string;
  readCount: number;
  totalSent: number;
}

export interface SupportTicket {
  id: string;
  ticketCode: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  category: 'Kỹ thuật / Video' | 'Thanh toán & VIP' | 'Tài khoản' | 'Góp ý nội dung';
  subject: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  replies?: {
    sender: 'admin' | 'user';
    name: string;
    text: string;
    time: string;
  }[];
}

/* =========================================================================
   INITIAL DATA SETS
   ========================================================================= */

export const INITIAL_MOVIES: Movie[] = [
  {
    id: 'movie-1',
    title: 'Deadpool & Wolverine: Hỗn Loạn Đa Vũ Trụ',
    originalTitle: 'Deadpool & Wolverine',
    synopsis: 'Wolverine đang hồi phục sau vết thương thì tình cờ gặp gỡ gã lầy lội Deadpool. Cả hai cùng hợp sức du hành qua các dòng thời gian để đánh bại kẻ thù chung.',
    poster: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    rating: 4.9,
    voteCount: 14200,
    year: 2024,
    quality: '4K HDR',
    ageLimit: '18+',
    isVip: true,
    status: 'active',
    genres: ['Hành Động', 'Hài Hước', 'Viễn Tưởng', 'Siêu Anh Hùng'],
    totalEpisodes: 1,
    views: 489200,
    createdAt: '2024-07-28',
    episodes: [
      {
        id: 'ep-1-1',
        episodeNumber: 1,
        title: 'Bản Chiếu Rạp Đầy Đủ (4K HDR)',
        duration: '128 phút',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop',
        views: 489200,
      }
    ]
  },
  {
    id: 'movie-2',
    title: 'Nông Dân Nhàn Nhã Ở Dị Giới (Mùa 2)',
    originalTitle: 'Isekai Nonbiri Nouka Season 2',
    synopsis: 'Sau khi qua đời vì bạo bệnh, Hiraku được thần linh ban cho một cơ thể bất hoại cùng Nông Cụ Vạn Năng để sống cuộc đời nông dân bình yên.',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 4.8,
    voteCount: 9800,
    year: 2024,
    quality: '4K HDR',
    ageLimit: '13+',
    isVip: false,
    status: 'active',
    genres: ['Anime', 'Isekai', 'Đời Thường', 'Hài Hước', 'Phép Thuật'],
    totalEpisodes: 12,
    views: 341000,
    createdAt: '2024-08-10',
    episodes: [
      {
        id: 'ep-2-1',
        episodeNumber: 1,
        title: 'Khai Phá Vùng Đất Rừng Tử Thần',
        duration: '24 phút',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop',
        views: 120500,
      },
      {
        id: 'ep-2-2',
        episodeNumber: 2,
        title: 'Những Người Bạn Tộc Vampire Đầu Tiên',
        duration: '24 phút',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop',
        views: 98400,
      },
      {
        id: 'ep-2-3',
        episodeNumber: 3,
        title: 'Cuộc Viếng Thăm Của Tộc Dwarf',
        duration: '25 phút',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop',
        views: 82100,
      }
    ]
  },
  {
    id: 'movie-3',
    title: 'Avatar: Dòng Chảy Của Nước',
    originalTitle: 'Avatar: The Way of Water',
    synopsis: 'Jake Sully sống cùng gia đình mới được thành lập trên hành tinh Pandora. Một mối đe dọa quen thuộc trở lại khiến Jake phải cùng Neytiri và đội quân bảo vệ hành tinh.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    rating: 4.9,
    voteCount: 22400,
    year: 2023,
    quality: '4K HDR',
    ageLimit: '13+',
    isVip: true,
    status: 'active',
    genres: ['Khoa Học Viễn Tưởng', 'Phiêu Lưu', 'Hành Động'],
    totalEpisodes: 1,
    views: 612000,
    createdAt: '2023-12-15',
    episodes: [
      {
        id: 'ep-3-1',
        episodeNumber: 1,
        title: 'Bản Chiếu Rạp 4K IMAX Enhanced',
        duration: '192 phút',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
        views: 612000,
      }
    ]
  },
  {
    id: 'movie-4',
    title: 'Oppenheimer: Kẻ Huỷ Diệt Thế Giới',
    originalTitle: 'Oppenheimer',
    synopsis: 'Câu chuyện về nhà vật lý lý thuyết J. Robert Oppenheimer, người lãnh đạo Dự án Manhattan phát triển bom nguyên tử trong Thế chiến II.',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    rating: 4.8,
    voteCount: 18900,
    year: 2023,
    quality: '4K HDR',
    ageLimit: '18+',
    isVip: true,
    status: 'active',
    genres: ['Lịch Sử', 'Tâm Lý', 'Chính Kịch'],
    totalEpisodes: 1,
    views: 395000,
    createdAt: '2023-11-20',
    episodes: [
      {
        id: 'ep-4-1',
        episodeNumber: 1,
        title: 'Bản Đầy Đủ 4K Ultra HD',
        duration: '180 phút',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=400&auto=format&fit=crop',
        views: 395000,
      }
    ]
  },
  {
    id: 'movie-5',
    title: 'Chú Thuật Hồi Chiến: Biến Cố Shibuya',
    originalTitle: 'Jujutsu Kaisen: Shibuya Incident',
    synopsis: 'Vào đêm Halloween tại Shibuya, một bức màn khổng lồ hạ xuống giam giữ hàng nghìn người dân nhằm mục đích phong ấn Chú Thuật Sư mạnh nhất - Gojo Satoru.',
    poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=pkKu9hLT-t8',
    rating: 4.9,
    voteCount: 31000,
    year: 2023,
    quality: '4K HDR',
    ageLimit: '16+',
    isVip: false,
    status: 'active',
    genres: ['Anime', 'Hành Động', 'Huyền Bí', 'Kinh Dị'],
    totalEpisodes: 18,
    views: 820000,
    createdAt: '2023-10-01',
    episodes: [
      {
        id: 'ep-5-1',
        episodeNumber: 1,
        title: 'Khởi Đầu Biến Cố Shibuya',
        duration: '24 phút',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
        views: 240000,
      }
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    fullName: 'Kurumi Tokisaki',
    email: 'kurumi124@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    role: 'user',
    vipTier: 'VIP 4K',
    vipExpiry: '2026-12-28',
    totalWatchedHours: 184,
    status: 'active',
    createdAt: '2024-01-15',
    lastActive: '10 phút trước',
    devices: [
      {
        id: 'dev-1',
        deviceName: 'iPhone 15 Pro Max',
        deviceType: 'mobile',
        ip: '113.161.42.18',
        location: 'TP. Hồ Chí Minh, VN',
        lastActive: 'Đang hoạt động',
      },
      {
        id: 'dev-2',
        deviceName: 'MacBook Pro M3',
        deviceType: 'desktop',
        ip: '113.161.42.18',
        location: 'TP. Hồ Chí Minh, VN',
        lastActive: '2 giờ trước',
      }
    ]
  },
  {
    id: 'user-2',
    fullName: 'Nguyễn Thanh Minh',
    email: 'minh.admin@cinestream.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    role: 'admin',
    vipTier: 'VIP 4K',
    vipExpiry: '2030-01-01',
    totalWatchedHours: 320,
    status: 'active',
    createdAt: '2023-11-01',
    lastActive: 'Đang trực tuyến',
    devices: [
      {
        id: 'dev-admin-1',
        deviceName: 'Windows 11 Workstation',
        deviceType: 'desktop',
        ip: '14.232.18.99',
        location: 'Hà Nội, VN',
        lastActive: 'Đang hoạt động',
      }
    ]
  },
  {
    id: 'user-3',
    fullName: 'Trần Hoàng Long',
    email: 'hoanglong99@yahoo.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    role: 'user',
    vipTier: 'VIP Standard',
    vipExpiry: '2026-10-15',
    totalWatchedHours: 72,
    status: 'active',
    createdAt: '2024-03-10',
    lastActive: '1 ngày trước',
    devices: [
      {
        id: 'dev-3',
        deviceName: 'Samsung Galaxy S24 Ultra',
        deviceType: 'mobile',
        ip: '171.244.10.82',
        location: 'Đà Nẵng, VN',
        lastActive: '1 ngày trước',
      }
    ]
  },
  {
    id: 'user-4',
    fullName: 'Lê Thảo My',
    email: 'thaomy.le@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    role: 'user',
    vipTier: 'Free',
    totalWatchedHours: 19,
    status: 'active',
    createdAt: '2024-06-20',
    lastActive: '3 giờ trước',
    devices: [
      {
        id: 'dev-4',
        deviceName: 'iPad Air 5',
        deviceType: 'mobile',
        ip: '118.69.15.22',
        location: 'Cần Thơ, VN',
        lastActive: '3 giờ trước',
      }
    ]
  },
  {
    id: 'user-5',
    fullName: 'Phạm Tuấn Anh (Spam Bot)',
    email: 'spambot991@tempmail.org',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
    role: 'user',
    vipTier: 'Free',
    totalWatchedHours: 0,
    status: 'banned',
    createdAt: '2024-09-01',
    lastActive: '7 ngày trước',
    devices: []
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    orderCode: 'ORD-20260912-001',
    user: {
      id: 'user-1',
      name: 'Kurumi Tokisaki',
      email: 'kurumi124@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    packageId: '1y',
    packageName: 'Gói VIP 1 Năm (4K HDR + Dolby)',
    amount: 599000,
    paymentMethod: 'MoMo',
    status: 'success',
    createdAt: '2026-09-12 09:15:30'
  },
  {
    id: 'tx-2',
    orderCode: 'ORD-20260912-002',
    user: {
      id: 'user-3',
      name: 'Trần Hoàng Long',
      email: 'hoanglong99@yahoo.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop'
    },
    packageId: '6m',
    packageName: 'Gói VIP 6 Tháng',
    amount: 349000,
    paymentMethod: 'VietQR',
    status: 'success',
    createdAt: '2026-09-12 08:30:12'
  },
  {
    id: 'tx-3',
    orderCode: 'ORD-20260911-089',
    user: {
      id: 'user-4',
      name: 'Lê Thảo My',
      email: 'thaomy.le@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
    },
    packageId: '1m',
    packageName: 'Gói VIP 1 Tháng',
    amount: 69000,
    paymentMethod: 'ZaloPay',
    status: 'pending',
    createdAt: '2026-09-11 21:40:05'
  },
  {
    id: 'tx-4',
    orderCode: 'ORD-20260910-044',
    user: {
      id: 'user-6',
      name: 'Đặng Quốc Bảo',
      email: 'quocbao.dang@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    packageId: '1y',
    packageName: 'Gói VIP 1 Năm (4K HDR + Dolby)',
    amount: 599000,
    paymentMethod: 'Visa/Mastercard',
    status: 'success',
    createdAt: '2026-09-10 14:12:00'
  }
];

export const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'cmt-1',
    movieId: 'movie-1',
    movieTitle: 'Deadpool & Wolverine',
    moviePoster: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=200&auto=format&fit=crop',
    user: {
      id: 'user-1',
      name: 'Kurumi Tokisaki',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      isVip: true
    },
    content: 'Phim đỉnh thực sự, đoạn combat cuối phim ghép nhạc đỉnh chóp luôn! Âm thanh Dolby Atmos nghe phê tai cực kỳ 🔥',
    likes: 42,
    replyCount: 5,
    status: 'approved',
    createdAt: '15 phút trước'
  },
  {
    id: 'cmt-2',
    movieId: 'movie-2',
    movieTitle: 'Nông Dân Nhàn Nhã Ở Dị Giới',
    moviePoster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop',
    user: {
      id: 'user-3',
      name: 'Trần Hoàng Long',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
      isVip: false
    },
    content: 'Tập 3 xem cười đau bụng, mong admin cập nhật tập 4 sớm nha, hóng quá trời!',
    likes: 18,
    replyCount: 2,
    status: 'approved',
    createdAt: '1 giờ trước'
  },
  {
    id: 'cmt-3',
    movieId: 'movie-1',
    movieTitle: 'Deadpool & Wolverine',
    moviePoster: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=200&auto=format&fit=crop',
    user: {
      id: 'user-5',
      name: 'Phạm Tuấn Anh',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
      isVip: false
    },
    content: 'Click vào link telegram này để nhận thẻ cào và xem full hd lậu không cần vip...',
    likes: 0,
    replyCount: 0,
    status: 'hidden',
    createdAt: '3 giờ trước'
  }
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    title: 'Tập Mới Đã Lên Sóng! 🎬',
    message: 'Nông Dân Nhàn Nhã Ở Dị Giới - Mùa 2 vừa phát hành Tập 3: Cuộc Viếng Thăm Của Tộc Dwarf. Xem ngay!',
    type: 'movie',
    targetAudience: 'all',
    actionRoute: '/watch/movie-2',
    sentAt: '2026-09-12 10:00:00',
    readCount: 1420,
    totalSent: 1850
  },
  {
    id: 'notif-2',
    title: 'Ưu Đãi VIP Vàng Dành Riêng Cho Bạn ⭐',
    message: 'Gia hạn gói VIP 1 Năm hôm nay để nhận thêm 30 ngày sử dụng miễn phí + Huy hiệu độc quyền.',
    type: 'vip',
    targetAudience: 'vip',
    actionRoute: '/sub-layout/billing-subscription',
    sentAt: '2026-09-11 15:30:00',
    readCount: 890,
    totalSent: 1020
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-1',
    ticketCode: 'TCK-20260912-01',
    user: {
      name: 'Kurumi Tokisaki',
      email: 'kurumi124@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    category: 'Kỹ thuật / Video',
    subject: 'Video bị giật khi bật chuẩn 4K HDR trên TV Samsung',
    message: 'Chào ban quản trị, khi em phát phim Deadpool chuẩn 4K trên Smart TV thì bị dừng hình ở phút 14, mong kỹ thuật kiểm tra luồng phát.',
    priority: 'high',
    status: 'open',
    createdAt: '2026-09-12 10:15:00',
    replies: [
      {
        sender: 'admin',
        name: 'Admin CINESTREAM',
        text: 'Chào Kurumi, kỹ thuật viên đã tối ưu lại bitrate luồng 4K trên máy chủ CDN miền Nam. Bạn vui lòng thử lại nhé!',
        time: '2026-09-12 10:30:00'
      }
    ]
  },
  {
    id: 'ticket-2',
    ticketCode: 'TCK-20260911-09',
    user: {
      name: 'Lê Thảo My',
      email: 'thaomy.le@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
    },
    category: 'Thanh toán & VIP',
    subject: 'Quét mã VietQR đã trừ tiền nhưng app chưa kích hoạt VIP',
    message: 'Mình vừa nạp gói 1 tháng qua VietQR lúc 21h40, tài khoản ngân hàng đã trừ 69k nhưng app vẫn hiện gói Free.',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-09-11 21:45:00'
  }
];

/* =========================================================================
   DASHBOARD KPI & ANALYTICS
   ========================================================================= */

export const DASHBOARD_STATS = {
  totalRevenueMonth: 124850000,
  revenueGrowthPercent: '+18.4%',
  totalViewsToday: 48920,
  viewsGrowthPercent: '+12.6%',
  activeUsersNow: 1420,
  totalVipUsers: 3840,
  vipGrowthPercent: '+24.1%',
  totalMovies: 128,
};

export const REVENUE_CHART_7DAYS = [
  { day: 'T2 (06/09)', revenue: 14200000, views: 38000 },
  { day: 'T3 (07/09)', revenue: 16800000, views: 41200 },
  { day: 'T4 (08/09)', revenue: 15400000, views: 39500 },
  { day: 'T5 (09/09)', revenue: 19100000, views: 44000 },
  { day: 'T6 (10/09)', revenue: 22500000, views: 51200 },
  { day: 'T7 (11/09)', revenue: 28400000, views: 64800 },
  { day: 'CN (12/09)', revenue: 24850000, views: 58900 },
];

export const GENRE_DISTRIBUTION = [
  { name: 'Hành Động / Chiếu Rạp', percentage: 38, count: 48, color: '#ff334b' },
  { name: 'Anime & Hoạt Hình', percentage: 28, count: 36, color: '#3b82f6' },
  { name: 'Viễn Tưởng & Kỳ Ảo', percentage: 18, count: 23, color: '#10b981' },
  { name: 'Tâm Lý & Tình Cảm', percentage: 16, count: 21, color: '#f59e0b' },
];
