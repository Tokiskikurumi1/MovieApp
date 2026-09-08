import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();

  const [wifiOnlyDownload, setWifiOnlyDownload] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài Khoản</Text>
        <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.75}>
          <Ionicons name="settings-outline" size={20} color={CinemaColors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
              }}
              style={styles.avatarImage}
            />
            <TouchableOpacity style={styles.editAvatarBadge} activeOpacity={0.8}>
              <Ionicons name="camera" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>Kurumi Tokisaki</Text>
              <View style={styles.vipBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFD700" />
                <Text style={styles.vipText}>VIP 4K</Text>
              </View>
            </View>
            <Text style={styles.userEmail}>kurumi124@gmail.com</Text>
            <Text style={styles.membershipExpiry}>Hạn dùng VIP: 28/12/2026</Text>
          </View>
        </View>

        {/* Premium Upgrade Banner */}
        <TouchableOpacity style={styles.premiumBanner} activeOpacity={0.85}>
          <View style={styles.premiumLeft}>
            <View style={styles.premiumIconBox}>
              <Ionicons name="sparkles" size={22} color="#FFD700" />
            </View>
            <View>
              <Text style={styles.premiumTitle}>Gói CINESTREAM Premium</Text>
              <Text style={styles.premiumSubtitle}>Xem không giới hạn 4K HDR & Dolby Atmos</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={CinemaColors.primary} />
        </TouchableOpacity>

        {/* Section 1: Cài đặt xem phim */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>CÀI ĐẶT PHÁT & TẢI XUỐNG</Text>

          <View style={styles.settingCard}>
            {/* Wi-Fi only download */}
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="wifi-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Chỉ tải qua Wi-Fi</Text>
              </View>
              <Switch
                value={wifiOnlyDownload}
                onValueChange={setWifiOnlyDownload}
                trackColor={{ false: CinemaColors.border, true: CinemaColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Auto play next */}
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="play-forward-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Tự động phát tập tiếp</Text>
              </View>
              <Switch
                value={autoPlayNext}
                onValueChange={setAutoPlayNext}
                trackColor={{ false: CinemaColors.border, true: CinemaColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Notifications */}
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="notifications-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Thông báo phim mới</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: CinemaColors.border, true: CinemaColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section 2: Quản lý tài khoản */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>TÀI KHOẢN & BẢO MẬT</Text>

          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingLinkRow} activeOpacity={0.7}>
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="person-circle-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Chỉnh sửa thông tin cá nhân</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingLinkRow} activeOpacity={0.7}>
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="lock-closed-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Đổi mật khẩu</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingLinkRow} activeOpacity={0.7}>
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="card-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Lịch sử thanh toán & Gói cước</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: Hỗ trợ & Khác */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>HỖ TRỢ & ĐIỀU KHOẢN</Text>

          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingLinkRow} activeOpacity={0.7}>
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="help-circle-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Trung tâm trợ giúp 24/7</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingLinkRow} activeOpacity={0.7}>
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="document-text-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Điều khoản & Chính sách bảo mật</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color={CinemaColors.error} />
          <Text style={styles.logoutButtonText}>Đăng Xuất Tài Khoản</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>CINESTREAM v2.4.0 (Build 2026)</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.3,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CinemaColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    marginBottom: 16,
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: CinemaColors.primary,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: CinemaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: CinemaColors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  vipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
  },
  userEmail: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    marginBottom: 2,
  },
  membershipExpiry: {
    fontSize: 11,
    color: CinemaColors.primary,
    fontWeight: '600',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 51, 75, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 75, 0.25)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  premiumIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 11,
    color: CinemaColors.textSecondary,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: CinemaColors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  settingCard: {
    backgroundColor: CinemaColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 51, 75, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CinemaColors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: CinemaColors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: CinemaColors.textMuted,
  },
});
