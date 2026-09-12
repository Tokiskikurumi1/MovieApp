import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';
import { useNotifications, NotificationItem } from '@/store/notification-context';

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'movies', label: 'Phim & Tập mới' },
  { id: 'vip', label: 'Tài khoản & VIP' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();
  const [selectedTab, setSelectedTab] = useState('all');

  const filteredNotifications = notifications.filter((item) => {
    if (selectedTab === 'unread') return !item.isRead;
    if (selectedTab === 'movies') return item.type === 'movie' || item.type === 'episode';
    if (selectedTab === 'vip') return item.type === 'vip' || item.type === 'promo' || item.type === 'system';
    return true;
  });

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc.');
  };

  const handleClearAll = () => {
    Alert.alert(
      'Xóa tất cả thông báo',
      'Bạn có chắc chắn muốn xóa toàn bộ danh sách thông báo không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa hết',
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ]
    );
  };

  const handleNotificationPress = (item: NotificationItem) => {
    markAsRead(item.id);

    if (item.actionRoute) {
      router.push(item.actionRoute as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={CinemaColors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Thông Báo</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerActionBtn}
              activeOpacity={0.7}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done" size={20} color={CinemaColors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsList}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                activeOpacity={0.75}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>
                  {tab.label}
                  {tab.id === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.notifCard,
                !item.isRead && styles.notifCardUnread,
              ]}
              activeOpacity={0.8}
              onPress={() => handleNotificationPress(item)}
            >
              {/* Unread Left Indicator Bar */}
              {!item.isRead && <View style={styles.unreadLeftBar} />}

              {/* Left Image or Icon */}
              {item.image ? (
                <View style={styles.imageThumbWrapper}>
                  <Image source={{ uri: item.image }} style={styles.imageThumb} />
                  {item.type === 'episode' && (
                    <View style={styles.playIconOverlay}>
                      <Ionicons name="play" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              ) : (
                <View
                  style={[
                    styles.iconBoxWrapper,
                    { backgroundColor: item.iconBg || 'rgba(255, 51, 75, 0.12)' },
                  ]}
                >
                  <Ionicons
                    name={item.icon || 'notifications'}
                    size={22}
                    color={item.iconColor || CinemaColors.primary}
                  />
                </View>
              )}

              {/* Center Content */}
              <View style={styles.notifBody}>
                <View style={styles.notifTitleRow}>
                  <Text
                    style={[
                      styles.notifTitle,
                      !item.isRead && styles.notifTitleUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.notifMessage} numberOfLines={3}>
                  {item.message}
                </Text>

                <View style={styles.notifFooterRow}>
                  <Text style={styles.notifTime}>{item.time}</Text>
                  <Ionicons name="chevron-forward" size={14} color={CinemaColors.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={42} color={CinemaColors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
            <Text style={styles.emptySubtitle}>
              Khi có phim mới, tập phim mới hoặc ưu đãi đặc quyền, thông báo sẽ hiển thị tại đây.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CinemaColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
  },
  unreadCountBadge: {
    backgroundColor: CinemaColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },

  /* Filter Tabs */
  filterTabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: CinemaColors.background,
  },
  filterTabsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: CinemaColors.surface,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  tabPillActive: {
    backgroundColor: CinemaColors.primary,
    borderColor: CinemaColors.primary,
  },
  tabPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Scroll Content */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: CinemaColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    position: 'relative',
    overflow: 'hidden',
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: '#191316',
    borderColor: 'rgba(255, 51, 75, 0.3)',
  },
  unreadLeftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: CinemaColors.primary,
  },
  imageThumbWrapper: {
    width: 58,
    height: 78,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surfaceElevated,
  },
  imageThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playIconOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255, 51, 75, 0.85)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    flex: 1,
    paddingRight: 6,
  },
  notifTitleUnread: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: CinemaColors.primary,
  },
  notifMessage: {
    fontSize: 12.5,
    color: CinemaColors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  notifFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTime: {
    fontSize: 11,
    color: CinemaColors.textMuted,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: CinemaColors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
});
