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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();

  const [wifiOnlyDownload, setWifiOnlyDownload] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const handleConfirmLogout = () => {
    setIsLogoutModalVisible(false);
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài Khoản</Text>
        <TouchableOpacity
          style={styles.headerActionBtn}
          activeOpacity={0.75}
          onPress={() => router.push('/sub-layout/account-security' as any)}
        >
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
            <TouchableOpacity
              style={styles.editAvatarBadge}
              activeOpacity={0.8}
              onPress={() => router.push('/sub-layout/account-security' as any)}
            >
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

        {/* User Stats Card (Số giờ xem, Phim đã xem, Yêu thích) */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconBadge}>
              <Ionicons name="time" size={16} color={CinemaColors.primary} />
            </View>
            <Text style={styles.statValue}>
              184<Text style={styles.statUnit}>h</Text>
            </Text>
            <Text style={styles.statLabel}>Số giờ xem</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconBadge}>
              <Ionicons name="play-circle" size={17} color={CinemaColors.primary} />
            </View>
            <Text style={styles.statValue}>96</Text>
            <Text style={styles.statLabel}>Phim đã xem</Text>
          </View>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            activeOpacity={0.75}
            onPress={() => router.push('/(tabs)/favorite' as any)}
          >
            <View style={styles.statIconBadge}>
              <Ionicons name="heart" size={16} color={CinemaColors.primary} />
            </View>
            <Text style={styles.statValue}>34</Text>
            <Text style={styles.statLabel}>Yêu thích</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Upgrade Banner */}
        <TouchableOpacity
          style={styles.premiumBanner}
          activeOpacity={0.85}
          onPress={() => router.push('/sub-layout/billing-subscription' as any)}
        >
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
            <TouchableOpacity
              style={styles.settingLinkRow}
              activeOpacity={0.7}
              onPress={() => router.push('/sub-layout/account-security' as any)}
            >
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Tài khoản & Bảo mật (Chi tiết)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingLinkRow}
              activeOpacity={0.7}
              onPress={() => router.push('/sub-layout/billing-subscription' as any)}
            >
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
            <TouchableOpacity
              style={styles.settingLinkRow}
              activeOpacity={0.7}
              onPress={() => router.push('/sub-layout/help-center' as any)}
            >
              <View style={styles.settingRowLeft}>
                <View style={styles.settingIconCircle}>
                  <Ionicons name="help-circle-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.settingLabel}>Trung tâm trợ giúp 24/7</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingLinkRow}
              activeOpacity={0.7}
              onPress={() => router.push('/sub-layout/terms-privacy' as any)}
            >
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
          onPress={() => setIsLogoutModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color={CinemaColors.error} />
          <Text style={styles.logoutButtonText}>Đăng Xuất Tài Khoản</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>CINESTREAM v2.4.0 (Build 2026)</Text>
      </ScrollView>

      {/* ============================================================= */}
      {/* MODAL: XÁC NHẬN ĐĂNG XUẤT (CENTERED POPUP MODAL)             */}
      {/* ============================================================= */}
      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsLogoutModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.logoutModalCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Top Red Glow Icon */}
            <View style={styles.logoutIconGlow}>
              <Ionicons name="log-out-outline" size={28} color={CinemaColors.error} />
            </View>

            <Text style={styles.logoutModalTitle}>Đăng Xuất</Text>
            <Text style={styles.logoutModalMessage}>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
            </Text>

            {/* Action Buttons */}
            <View style={styles.logoutModalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelLogoutBtn}
                activeOpacity={0.8}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.cancelLogoutText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                activeOpacity={0.85}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmLogoutText}>Đăng Xuất</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  /* Stats Card */
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CinemaColors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 51, 75, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 75, 0.25)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: CinemaColors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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

  /* Centered Logout Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  logoutModalCard: {
    width: '100%',
    backgroundColor: CinemaColors.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  logoutIconGlow: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  logoutModalMessage: {
    fontSize: 13.5,
    color: CinemaColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  logoutModalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelLogoutBtn: {
    flex: 1,
    backgroundColor: CinemaColors.surfaceElevated,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  cancelLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  confirmLogoutBtn: {
    flex: 1,
    backgroundColor: CinemaColors.error,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
