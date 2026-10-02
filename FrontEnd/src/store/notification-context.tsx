import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';
import { NotificationAPI } from '@/services/API';
import { getSocket } from '@/services/socket';

export interface NotificationItem {
  id: string;
  type: 'movie' | 'episode' | 'vip' | 'promo' | 'system' | string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  image?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  movieId?: number;
  movieSlug?: string;
  actionRoute?:
    | string
    | {
        pathname: string;
        params?: any;
      };
}

const FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'movie',
    title: 'Bom Tấn Mới: Mục Thần Ký 🎬',
    message: 'Mục Thần Ký đã chính thức có mặt trên CINESTREAM với chuẩn hình ảnh Full HD & Vietsub. Xem ngay hôm nay!',
    time: '15 phút trước',
    isRead: false,
    image: 'https://phimimg.com/upload/vod/20241028-1/33727a6c4cec6ab127dbb0092bc99c9e.jpg',
    movieSlug: 'muc-than-ky',
    actionRoute: '/movie/muc-than-ky',
  },
  {
    id: 'notif-2',
    type: 'vip',
    title: 'Ưu Đãi VIP Vàng Dành Riêng Cho Bạn ⭐',
    message: 'Nâng cấp gói VIP để trải nghiệm xem phim không quảng cáo, mở khóa chất lượng 4K HDR và âm thanh vòm đỉnh cao.',
    time: '2 giờ trước',
    isRead: false,
    icon: 'diamond',
    iconColor: '#FFD700',
    iconBg: 'rgba(255, 215, 0, 0.15)',
    actionRoute: '/sub-layout/billing-subscription',
  },
];

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  hasUnread: boolean;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'isRead' | 'time'> & { time?: string }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(FALLBACK_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await NotificationAPI.getNotifications();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải thông báo từ máy chủ:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Kết nối Socket.io lắng nghe push notification thời gian thực
    try {
      const socket = getSocket();
      const handleNewNotification = (notif: any) => {
        const mapped: NotificationItem = {
          id: notif.id || `notif-${Date.now()}`,
          type: notif.type || 'movie',
          title: notif.title,
          message: notif.message,
          time: notif.time || 'Vừa xong',
          isRead: false,
          image: notif.image,
          movieId: notif.movieId,
          movieSlug: notif.movieSlug,
          actionRoute: notif.actionRoute || (notif.movieSlug ? `/movie/${notif.movieSlug}` : '/(tabs)'),
        };

        setNotifications((prev) => {
          // Tránh trùng ID
          if (prev.some((item) => item.id === mapped.id)) {
            return prev;
          }
          return [mapped, ...prev];
        });
      };

      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    } catch (socketErr) {
      console.warn('Socket notification error:', socketErr);
    }
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length;
  }, [notifications]);

  const hasUnread = unreadCount > 0;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    NotificationAPI.markAsRead(id).catch((err) =>
      console.warn('Lỗi đồng bộ đã đọc thông báo:', err)
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    NotificationAPI.markAllAsRead().catch((err) =>
      console.warn('Lỗi đồng bộ đã đọc tất cả thông báo:', err)
    );
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
        isLoading,
        refreshNotifications: fetchNotifications,
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
