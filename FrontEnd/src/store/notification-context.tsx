import React, { createContext, useContext, useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';

export interface NotificationItem {
  id: string;
  type: 'movie' | 'episode' | 'vip' | 'promo' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  image?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  actionRoute?: {
    pathname: string;
    params?: any;
  };
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'episode',
    title: 'Tập Mới Đã Lên Sóng! 🎬',
    message: 'Nông Dân Nhàn Nhã Ở Dị Giới - Mùa 2 vừa phát hành Tập 3: Cuộc Viếng Thăm Của Tộc Dwarf. Xem ngay chất lượng 4K!',
    time: '15 phút trước',
    isRead: false,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop',
    actionRoute: {
      pathname: '/watch/[id]',
      params: { id: 'anime-1' },
    },
  },
  {
    id: 'notif-2',
    type: 'vip',
    title: 'Ưu Đãi VIP Vàng Dành Riêng Cho Bạn ⭐',
    message: 'Gia hạn gói VIP 1 Năm hôm nay để nhận thêm 30 ngày sử dụng miễn phí + Huy hiệu thành viên độc quyền.',
    time: '2 giờ trước',
    isRead: false,
    icon: 'diamond',
    iconColor: '#FFD700',
    iconBg: 'rgba(255, 215, 0, 0.15)',
    actionRoute: {
      pathname: '/sub-layout/billing-subscription',
    },
  },
  {
    id: 'notif-3',
    type: 'movie',
    title: 'Phim Chiếu Rạp Mới: Deadpool & Wolverine 🔥',
    message: 'Bom tấn siêu anh hùng Marvel với định dạng 4K HDR & Dolby Atmos đã chính thức có mặt trên CINESTREAM.',
    time: '5 giờ trước',
    isRead: false,
    image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=300&auto=format&fit=crop',
    actionRoute: {
      pathname: '/movie/[id]',
      params: { id: 'fav-3' },
    },
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Đăng Nhập Thiết Bị Mới 📱',
    message: 'Tài khoản của bạn vừa đăng nhập trên thiết bị iPhone 15 Pro Max tại TP. Hồ Chí Minh. Nếu không phải bạn, hãy đổi mật khẩu ngay.',
    time: '1 ngày trước',
    isRead: true,
    icon: 'shield-checkmark',
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    actionRoute: {
      pathname: '/sub-layout/account-security',
    },
  },
  {
    id: 'notif-5',
    type: 'movie',
    title: 'Gợi Ý Dành Cho Bạn: Avatar: Dòng Chảy Của Nước',
    message: 'Dựa trên danh sách phim yêu thích của bạn, bom tấn Avatar 2 đang được 98% khán giả đánh giá 5 sao.',
    time: '2 ngày trước',
    isRead: true,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop',
    actionRoute: {
      pathname: '/movie/[id]',
      params: { id: 'fav-1' },
    },
  },
  {
    id: 'notif-6',
    type: 'promo',
    title: 'Quà Tặng Tri Ân Khách Hàng Thân Thiết 🎁',
    message: 'Nhận ngay Voucher giảm giá 50.000đ khi thanh toán qua Ví điện tử MoMo trong tuần lễ phim điện ảnh.',
    time: '3 ngày trước',
    isRead: true,
    icon: 'gift',
    iconColor: CinemaColors.primary,
    iconBg: 'rgba(255, 51, 75, 0.15)',
    actionRoute: {
      pathname: '/sub-layout/billing-subscription',
    },
  },
];

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  hasUnread: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'isRead' | 'time'> & { time?: string }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length;
  }, [notifications]);

  const hasUnread = unreadCount > 0;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'isRead' | 'time'> & { time?: string }) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      time: item.time || 'Vừa xong',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasUnread,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
