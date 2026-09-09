import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StatusBar,
  Alert,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CinemaColors } from '@/constants/theme';

interface DeviceSession {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tv';
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const INITIAL_DEVICES: DeviceSession[] = [
  {
    id: 'dev-1',
    name: 'iPhone 15 Pro Max',
    type: 'mobile',
    location: 'Hà Nội, Việt Nam',
    lastActive: 'Đang hoạt động',
    isCurrent: true,
  },
  {
    id: 'dev-2',
    name: 'Windows 11 (Chrome)',
    type: 'desktop',
    location: 'Hồ Chí Minh, Việt Nam',
    lastActive: '2 giờ trước',
    isCurrent: false,
  },
  {
    id: 'dev-3',
    name: 'Samsung 4K QLED Smart TV',
    type: 'tv',
    location: 'Hà Nội, Việt Nam',
    lastActive: 'Hôm qua, 20:30',
    isCurrent: false,
  },
];

// Preset Avatars for Cinema / Anime App
const AVATAR_PRESETS = [
  {
    id: 'av-1',
    name: 'Kurumi Tokisaki',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'av-2',
    name: 'Cyberpunk Red',
    uri: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'av-3',
    name: 'Sci-Fi Pilot',
    uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'av-4',
    name: 'Anime Mage',
    uri: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'av-5',
    name: 'Hero Shadow',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'av-6',
    name: 'Cinema Director',
    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
  },
];

export default function AccountSecurityScreen() {
  const router = useRouter();

  // User Profile State
  const [fullName, setFullName] = useState('Kurumi Tokisaki');
  const [email] = useState('kurumi124@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('0987654321');
  const [userAvatar, setUserAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
  );

  // Security Switches
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Device Sessions State
  const [devices, setDevices] = useState<DeviceSession[]>(INITIAL_DEVICES);

  // -------------------------------------------------------------
  // FORM 1: THAY ĐỔI ẢNH ĐẠI DIỆN (AVATAR PICKER)
  // -------------------------------------------------------------
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(userAvatar);
  const [isUploading, setIsUploading] = useState(false);

  const openAvatarModal = () => {
    setTempAvatar(userAvatar);
    setIsAvatarModalVisible(true);
  };

  // Chọn ảnh từ thư viện thiết bị
  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để thay đổi avatar.');
        return;
      }

      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      setIsUploading(false);

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setTempAvatar(result.assets[0].uri);
      }
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh. Vui lòng thử lại.');
    }
  };

  // Chụp ảnh mới từ camera
  const takePhotoWithCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập máy ảnh để chụp ảnh đại diện.');
        return;
      }

      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      setIsUploading(false);

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setTempAvatar(result.assets[0].uri);
      }
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Lỗi', 'Không thể khởi động máy ảnh. Vui lòng thử lại.');
    }
  };

  // Lưu avatar
  const handleSaveAvatar = () => {
    setUserAvatar(tempAvatar);
    setIsAvatarModalVisible(false);
    Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện mới!');
  };

  // -------------------------------------------------------------
  // FORM 2: CHỈNH SỬA THÔNG TIN CÁ NHÂN & VALIDATION
  // -------------------------------------------------------------
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [tempName, setTempName] = useState(fullName);
  const [tempPhone, setTempPhone] = useState(phoneNumber);
  const [profileErrors, setProfileErrors] = useState<{ name?: string; phone?: string }>({});

  const openEditProfileModal = () => {
    setTempName(fullName);
    setTempPhone(phoneNumber);
    setProfileErrors({});
    setIsEditProfileVisible(true);
  };

  const validateProfileForm = () => {
    const errors: { name?: string; phone?: string } = {};
    const trimmedName = tempName.trim();
    const cleanPhone = tempPhone.replace(/\s+/g, '');

    // Kiểm tra Họ và tên
    if (!trimmedName) {
      errors.name = 'Họ và tên không được để trống';
    } else if (trimmedName.length < 2) {
      errors.name = 'Họ và tên phải có tối thiểu 2 ký tự';
    } else if (trimmedName.length > 50) {
      errors.name = 'Họ và tên không được vượt quá 50 ký tự';
    }

    // Kiểm tra Số điện thoại (Định dạng SĐT Việt Nam 10 chữ số bắt đầu bằng 0)
    if (!cleanPhone) {
      errors.phone = 'Số điện thoại không được để trống';
    } else {
      const vnfRegex = /^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/;
      if (!vnfRegex.test(cleanPhone)) {
        errors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)';
      }
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = () => {
    if (!validateProfileForm()) return;

    setFullName(tempName.trim());
    setPhoneNumber(tempPhone.replace(/\s+/g, ''));
    setIsEditProfileVisible(false);
    Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!');
  };

  // -------------------------------------------------------------
  // FORM 3: ĐỔI MẬT KHẨU & VALIDATION
  // -------------------------------------------------------------
  const [isChangePassVisible, setIsChangePassVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPass?: string;
    newPass?: string;
    confirmPass?: string;
  }>({});

  const openChangePassModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setPasswordErrors({});
    setIsChangePassVisible(true);
  };

  // Đánh giá độ mạnh mật khẩu (Password Strength)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, label: '', color: CinemaColors.border };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { level: 1, label: 'Yếu', color: '#EF4444' };
    if (score <= 4) return { level: 2, label: 'Trung bình', color: '#F59E0B' };
    return { level: 3, label: 'Rất mạnh', color: '#10B981' };
  };

  const validatePasswordForm = () => {
    const errors: { currentPass?: string; newPass?: string; confirmPass?: string } = {};

    // 1. Kiểm tra Mật khẩu hiện tại
    if (!currentPassword) {
      errors.currentPass = 'Vui lòng nhập mật khẩu hiện tại';
    }

    // 2. Kiểm tra Mật khẩu mới
    if (!newPassword) {
      errors.newPass = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      errors.newPass = 'Mật khẩu mới phải có tối thiểu 6 ký tự';
    } else if (currentPassword && newPassword === currentPassword) {
      errors.newPass = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
    }

    // 3. Kiểm tra Xác nhận mật khẩu mới
    if (!confirmPassword) {
      errors.confirmPass = 'Vui lòng xác nhận lại mật khẩu mới';
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPass = 'Mật khẩu xác nhận không trùng khớp';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = () => {
    if (!validatePasswordForm()) return;

    setIsChangePassVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Thành công', 'Đổi mật khẩu thành công! Hãy dùng mật khẩu mới cho lần đăng nhập sau.');
  };

  // -------------------------------------------------------------
  // OTHER ACTIONS (DEVICES & DANGER ZONE)
  // -------------------------------------------------------------
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleLogoutDevice = (deviceId: string) => {
    Alert.alert(
      'Đăng xuất thiết bị',
      'Bạn có chắc chắn muốn đăng xuất tài khoản khỏi thiết bị này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            setDevices((prev) => prev.filter((d) => d.id !== deviceId));
          },
        },
      ]
    );
  };

  const handleLogoutAllOtherDevices = () => {
    Alert.alert(
      'Đăng xuất tất cả thiết bị khác',
      'Tất cả các thiết bị khác ngoài thiết bị này sẽ bị đăng xuất ngay lập tức.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: () => {
            setDevices((prev) => prev.filter((d) => d.isCurrent));
            Alert.alert('Thành công', 'Đã đăng xuất khỏi tất cả thiết bị khác.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.trim() !== 'XÓA TÀI KHOẢN') {
      Alert.alert('Lỗi', 'Vui lòng nhập chính xác cụm từ "XÓA TÀI KHOẢN" để xác nhận.');
      return;
    }
    setIsDeleteModalVisible(false);
    setDeleteConfirmText('');
    Alert.alert('Đã xóa', 'Tài khoản của bạn đã được xóa khỏi hệ thống.', [
      {
        text: 'Đóng',
        onPress: () => router.replace('/(auth)/login' as any),
      },
    ]);
  };

  const getDeviceIcon = (type: DeviceSession['type']) => {
    switch (type) {
      case 'desktop':
        return 'laptop-outline';
      case 'tv':
        return 'tv-outline';
      default:
        return 'phone-portrait-outline';
    }
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* ---------------- TOP NAVIGATION BAR ---------------- */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleIconButton}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={22} color={CinemaColors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.headerTitle}>Tài Khoản & Bảo Mật</Text>
          <Text style={styles.headerSubtitle}>Quản lý thông tin & an toàn đăng nhập</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ---------------- 1. USER OVERVIEW CARD ---------------- */}
        <View style={styles.profileOverviewCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.85}
            onPress={openAvatarModal}
          >
            <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
            <View style={styles.avatarEditBtn}>
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.userOverviewInfo}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.profileName} numberOfLines={1}>
                {fullName}
              </Text>
              <View style={styles.vipTag}>
                <Ionicons name="shield-checkmark" size={11} color="#FFD700" />
                <Text style={styles.vipTagText}>VIP 4K</Text>
              </View>
            </View>
            <Text style={styles.profileEmail}>{email}</Text>
            <Text style={styles.securityScoreText}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" /> Trạng thái: An toàn cao
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editProfilePencilBtn}
            activeOpacity={0.75}
            onPress={openEditProfileModal}
          >
            <Ionicons name="pencil" size={16} color={CinemaColors.primary} />
          </TouchableOpacity>
        </View>

        {/* ---------------- 2. THÔNG TIN CÁ NHÂN ---------------- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>THÔNG TIN CÁ NHÂN</Text>

          <View style={styles.card}>
            {/* Ảnh đại diện */}
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={openAvatarModal}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="image-outline" size={18} color={CinemaColors.primary} />
                </View>
                <View>
                  <Text style={styles.itemLabel}>Ảnh đại diện</Text>
                  <Text style={styles.itemSubValue}>Chạm để chọn từ thư viện hoặc chụp mới</Text>
                </View>
              </View>
              <Image source={{ uri: userAvatar }} style={styles.smallAvatarThumbnail} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Họ và tên */}
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={openEditProfileModal}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="person-outline" size={18} color={CinemaColors.primary} />
                </View>
                <View>
                  <Text style={styles.itemLabel}>Họ và tên</Text>
                  <Text style={styles.itemSubValue}>{fullName}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Email */}
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="mail-outline" size={18} color={CinemaColors.primary} />
                </View>
                <View>
                  <Text style={styles.itemLabel}>Email liên kết</Text>
                  <Text style={styles.itemSubValue}>{email}</Text>
                </View>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                <Text style={styles.verifiedText}>Đã xác thực</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Số điện thoại */}
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={openEditProfileModal}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="call-outline" size={18} color={CinemaColors.primary} />
                </View>
                <View>
                  <Text style={styles.itemLabel}>Số điện thoại</Text>
                  <Text style={styles.itemSubValue}>
                    {phoneNumber
                      ? phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
                      : 'Chưa cập nhật'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------- 3. BẢO MẬT & ĐĂNG NHẬP ---------------- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>BẢO MẬT & ĐĂNG NHẬP</Text>

          <View style={styles.card}>
            {/* Đổi mật khẩu */}
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={openChangePassModal}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-closed-outline" size={18} color={CinemaColors.primary} />
                </View>
                <View>
                  <Text style={styles.itemLabel}>Đổi mật khẩu</Text>
                  <Text style={styles.itemSubValue}>Cập nhật lần cuối 30 ngày trước</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Xác thực 2 bước (2FA) */}
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={CinemaColors.primary} />
                </View>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.itemLabel}>Xác thực 2 yếu tố (2FA)</Text>
                  <Text style={styles.itemSubValue}>Bảo vệ tài khoản qua mã OTP SMS/Email</Text>
                </View>
              </View>
              <Switch
                value={twoFactorAuth}
                onValueChange={setTwoFactorAuth}
                trackColor={{ false: CinemaColors.border, true: CinemaColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Đăng nhập sinh trắc học */}
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="finger-print-outline" size={18} color={CinemaColors.primary} />
                </View>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.itemLabel}>Đăng nhập Face ID / Vân tay</Text>
                  <Text style={styles.itemSubValue}>Mở khóa ứng dụng nhanh chóng & an toàn</Text>
                </View>
              </View>
              <Switch
                value={biometricLogin}
                onValueChange={setBiometricLogin}
                trackColor={{ false: CinemaColors.border, true: CinemaColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Cảnh báo đăng nhập lạ */}
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="notifications-outline" size={18} color={CinemaColors.primary} />
                </View>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.itemLabel}>Cảnh báo đăng nhập bất thường</Text>
                  <Text style={styles.itemSubValue}>Gửi thông báo khi phát hiện thiết bị lạ</Text>
                </View>
              </View>
              <Switch
                value={loginAlerts}
                onValueChange={setLoginAlerts}
                trackColor={{ false: CinemaColors.border, true: CinemaColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* ---------------- 4. QUẢN LÝ THIẾT BỊ ĐĂNG NHẬP ---------------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>THIẾT BỊ ĐANG ĐĂNG NHẬP ({devices.length})</Text>
            {devices.length > 1 && (
              <TouchableOpacity onPress={handleLogoutAllOtherDevices} activeOpacity={0.75}>
                <Text style={styles.logoutOthersText}>Đăng xuất thiết bị khác</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.card}>
            {devices.map((device, index) => (
              <React.Fragment key={device.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.deviceRow}>
                  <View style={styles.rowLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        device.isCurrent && { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                      ]}
                    >
                      <Ionicons
                        name={getDeviceIcon(device.type)}
                        size={18}
                        color={device.isCurrent ? '#10B981' : CinemaColors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.deviceNameRow}>
                        <Text style={styles.deviceNameText}>{device.name}</Text>
                        {device.isCurrent && (
                          <View style={styles.currentDeviceBadge}>
                            <Text style={styles.currentDeviceText}>Thiết bị này</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.deviceSubText}>
                        {device.location} •{' '}
                        <Text style={device.isCurrent ? styles.activeNowText : styles.lastActiveText}>
                          {device.lastActive}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {!device.isCurrent && (
                    <TouchableOpacity
                      style={styles.deviceLogoutBtn}
                      activeOpacity={0.7}
                      onPress={() => handleLogoutDevice(device.id)}
                    >
                      <Ionicons name="log-out-outline" size={17} color={CinemaColors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ---------------- 5. VÙNG NGUY HIỂM (DANGER ZONE) ---------------- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>VÙNG NGUY HIỂM</Text>

          <View style={[styles.card, styles.dangerCard]}>
            <TouchableOpacity
              style={styles.dangerRow}
              activeOpacity={0.7}
              onPress={() => setIsDeleteModalVisible(true)}
            >
              <View style={styles.rowLeft}>
                <View style={styles.dangerIconCircle}>
                  <Ionicons name="trash-outline" size={18} color={CinemaColors.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dangerLabel}>Xóa tài khoản vĩnh viễn</Text>
                  <Text style={styles.dangerSubText}>
                    Xóa vĩnh viễn dữ liệu xem, danh sách phim và thông tin tài khoản.
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={CinemaColors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ============================================================= */}
      {/* MODAL 1: THAY ĐỔI ẢNH ĐẠI DIỆN (AVATAR PICKER MODAL)         */}
      {/* ============================================================= */}
      <Modal
        visible={isAvatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Đổi Ảnh Đại Diện</Text>
                <Text style={styles.modalSubtitle}>Chọn từ thư viện, chụp ảnh hoặc bộ sưu tập mẫu</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAvatarModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={CinemaColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Avatar Preview Center */}
            <View style={styles.avatarPreviewCenter}>
              <View style={styles.previewAvatarWrapper}>
                <Image source={{ uri: tempAvatar }} style={styles.previewAvatarImage} />
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={CinemaColors.primary} />
                  </View>
                )}
              </View>
              <Text style={styles.previewAvatarHint}>Xem trước ảnh đại diện</Text>
            </View>

            {/* 2 Quick Action Buttons: Gallery & Camera */}
            <View style={styles.avatarSourceActions}>
              <TouchableOpacity
                style={styles.sourceBtn}
                activeOpacity={0.8}
                onPress={pickImageFromGallery}
              >
                <Ionicons name="images-outline" size={20} color={CinemaColors.primary} />
                <Text style={styles.sourceBtnText}>Chọn từ Thư viện</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sourceBtn}
                activeOpacity={0.8}
                onPress={takePhotoWithCamera}
              >
                <Ionicons name="camera-outline" size={20} color={CinemaColors.primary} />
                <Text style={styles.sourceBtnText}>Chụp Ảnh Mới</Text>
              </TouchableOpacity>
            </View>

            {/* Preset Avatars Row */}
            <Text style={styles.presetsHeading}>HOẶC CHỌN TỪ BỘ SƯU TẬP</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsList}
            >
              {AVATAR_PRESETS.map((item) => {
                const isSelected = tempAvatar === item.uri;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.presetItemBtn,
                      isSelected && styles.presetItemBtnSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setTempAvatar(item.uri)}
                  >
                    <Image source={{ uri: item.uri }} style={styles.presetImage} />
                    {isSelected && (
                      <View style={styles.presetCheckBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsAvatarModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveAvatar}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSubmitBtnText}>Lưu Ảnh Này</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL 2: CHỈNH SỬA THÔNG TIN CÁ NHÂN VỚI VALIDATION         */}
      {/* ============================================================= */}
      <Modal
        visible={isEditProfileVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditProfileVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Chỉnh Sửa Thông Tin</Text>
                <Text style={styles.modalSubtitle}>Cập nhật họ tên và số điện thoại liên hệ</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditProfileVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={CinemaColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Input 1: Họ và tên */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>
                Họ và tên <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  profileErrors.name && styles.inputErrorBorder,
                ]}
                value={tempName}
                onChangeText={(text) => {
                  setTempName(text);
                  if (profileErrors.name) {
                    setProfileErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="Nhập họ và tên..."
                placeholderTextColor={CinemaColors.textMuted}
              />
              {profileErrors.name && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle-outline" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{profileErrors.name}</Text>
                </View>
              )}
            </View>

            {/* Input 2: Số điện thoại */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>
                Số điện thoại <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  profileErrors.phone && styles.inputErrorBorder,
                ]}
                value={tempPhone}
                onChangeText={(text) => {
                  setTempPhone(text);
                  if (profileErrors.phone) {
                    setProfileErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
                placeholder="Ví dụ: 0987654321..."
                placeholderTextColor={CinemaColors.textMuted}
                keyboardType="phone-pad"
                maxLength={12}
              />
              {profileErrors.phone && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle-outline" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{profileErrors.phone}</Text>
                </View>
              )}
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditProfileVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveProfile}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSubmitBtnText}>Lưu Thay Đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL 3: ĐỔI MẬT KHẨU VỚI VALIDATION & PASSWORD STRENGTH    */}
      {/* ============================================================= */}
      <Modal
        visible={isChangePassVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsChangePassVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Đổi Mật Khẩu</Text>
                <Text style={styles.modalSubtitle}>Thiết lập mật khẩu mới bảo mật hơn</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsChangePassVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={CinemaColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* 1. Mật khẩu hiện tại */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>
                Mật khẩu hiện tại <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.passwordInputWrapper,
                  passwordErrors.currentPass && styles.inputErrorBorder,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (passwordErrors.currentPass) {
                      setPasswordErrors((prev) => ({ ...prev, currentPass: undefined }));
                    }
                  }}
                  secureTextEntry={!showCurrentPass}
                  placeholder="Nhập mật khẩu đang dùng..."
                  placeholderTextColor={CinemaColors.textMuted}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPass(!showCurrentPass)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showCurrentPass ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={CinemaColors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {passwordErrors.currentPass && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle-outline" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{passwordErrors.currentPass}</Text>
                </View>
              )}
            </View>

            {/* 2. Mật khẩu mới */}
            <View style={styles.modalInputGroup}>
              <View style={styles.labelWithStrengthRow}>
                <Text style={styles.inputLabel}>
                  Mật khẩu mới <Text style={styles.requiredStar}>*</Text>
                </Text>
                {newPassword.length > 0 && (
                  <Text style={[styles.strengthLabel, { color: passStrength.color }]}>
                    Độ mạnh: {passStrength.label}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.passwordInputWrapper,
                  passwordErrors.newPass && styles.inputErrorBorder,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (passwordErrors.newPass) {
                      setPasswordErrors((prev) => ({ ...prev, newPass: undefined }));
                    }
                  }}
                  secureTextEntry={!showNewPass}
                  placeholder="Tối thiểu 6 ký tự..."
                  placeholderTextColor={CinemaColors.textMuted}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPass(!showNewPass)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showNewPass ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={CinemaColors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Password strength progress bar */}
              {newPassword.length > 0 && (
                <View style={styles.strengthBarContainer}>
                  <View
                    style={[
                      styles.strengthBarSegment,
                      passStrength.level >= 1 && { backgroundColor: passStrength.color },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBarSegment,
                      passStrength.level >= 2 && { backgroundColor: passStrength.color },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBarSegment,
                      passStrength.level >= 3 && { backgroundColor: passStrength.color },
                    ]}
                  />
                </View>
              )}

              {passwordErrors.newPass && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle-outline" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{passwordErrors.newPass}</Text>
                </View>
              )}
            </View>

            {/* 3. Xác nhận mật khẩu mới */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>
                Xác nhận mật khẩu mới <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.passwordInputWrapper,
                  passwordErrors.confirmPass && styles.inputErrorBorder,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (passwordErrors.confirmPass) {
                      setPasswordErrors((prev) => ({ ...prev, confirmPass: undefined }));
                    }
                  }}
                  secureTextEntry={!showConfirmPass}
                  placeholder="Nhập lại mật khẩu mới..."
                  placeholderTextColor={CinemaColors.textMuted}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPass(!showConfirmPass)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={CinemaColors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {passwordErrors.confirmPass && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle-outline" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{passwordErrors.confirmPass}</Text>
                </View>
              )}
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsChangePassVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleChangePassword}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSubmitBtnText}>Xác Nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL 4: XÓA TÀI KHOẢN VĨNH VIỄN                             */}
      {/* ============================================================= */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalCard, styles.deleteModalCard]}>
            <View style={styles.deleteWarningIconBox}>
              <Ionicons name="warning" size={32} color={CinemaColors.error} />
            </View>
            <Text style={styles.deleteModalTitle}>Xóa Tài Khoản Vĩnh Viễn</Text>
            <Text style={styles.deleteModalWarningText}>
              Hành động này <Text style={{ fontWeight: '800', color: CinemaColors.error }}>không thể hoàn tác</Text>.
              Mọi lịch sử xem phim, danh sách yêu thích và đặc quyền VIP sẽ bị hủy ngay lập tức.
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>
                Nhập <Text style={{ color: CinemaColors.error, fontWeight: '700' }}>XÓA TÀI KHOẢN</Text> để tiếp tục:
              </Text>
              <TextInput
                style={[styles.modalInput, styles.deleteConfirmInput]}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="XÓA TÀI KHOẢN"
                placeholderTextColor={CinemaColors.textMuted}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setDeleteConfirmText('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Hủy Bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, styles.deleteSubmitBtn]}
                onPress={handleDeleteAccount}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteSubmitBtnText}>Xác Nhận Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CinemaColors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: CinemaColors.background,
  },
  topBarCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: CinemaColors.textSecondary,
    marginTop: 2,
  },
  circleIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* 1. User Overview Card */
  profileOverviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CinemaColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    marginBottom: 20,
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: CinemaColors.primary,
  },
  avatarEditBtn: {
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
  smallAvatarThumbnail: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CinemaColors.primary,
  },
  userOverviewInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  vipTag: {
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
  vipTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
  },
  profileEmail: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    marginBottom: 4,
  },
  securityScoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  editProfilePencilBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 75, 0.25)',
  },

  /* Sections & Cards */
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: CinemaColors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  logoutOthersText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: CinemaColors.primary,
    marginBottom: 8,
  },
  card: {
    backgroundColor: CinemaColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    paddingHorizontal: 16,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 51, 75, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CinemaColors.textPrimary,
    marginBottom: 2,
  },
  itemSubValue: {
    fontSize: 11.5,
    color: CinemaColors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },

  /* Devices */
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  deviceNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  currentDeviceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentDeviceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  deviceSubText: {
    fontSize: 11.5,
    color: CinemaColors.textSecondary,
  },
  activeNowText: {
    color: '#10B981',
    fontWeight: '600',
  },
  lastActiveText: {
    color: CinemaColors.textMuted,
  },
  deviceLogoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Danger Zone */
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
  },
  dangerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  dangerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: CinemaColors.error,
    marginBottom: 2,
  },
  dangerSubText: {
    fontSize: 11.5,
    color: CinemaColors.textSecondary,
    paddingRight: 10,
  },

  /* Modal Generic Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#161822',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: CinemaColors.textSecondary,
    marginTop: 2,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
    marginBottom: 6,
  },
  requiredStar: {
    color: CinemaColors.error,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: CinemaColors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: CinemaColors.textPrimary,
    fontSize: 14,
  },
  inputErrorBorder: {
    borderColor: CinemaColors.error,
    borderWidth: 1.2,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
    paddingLeft: 2,
  },
  errorText: {
    fontSize: 11.5,
    color: CinemaColors.error,
    fontWeight: '500',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CinemaColors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 11,
    color: CinemaColors.textPrimary,
    fontSize: 14,
  },

  /* Avatar Picker Modal Styles */
  avatarPreviewCenter: {
    alignItems: 'center',
    marginVertical: 10,
  },
  previewAvatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: CinemaColors.primary,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CinemaColors.surfaceElevated,
  },
  previewAvatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewAvatarHint: {
    fontSize: 11.5,
    color: CinemaColors.textMuted,
    marginTop: 6,
  },
  avatarSourceActions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14,
  },
  sourceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 75, 0.3)',
    borderRadius: 10,
    paddingVertical: 11,
  },
  sourceBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  presetsHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: CinemaColors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 4,
  },
  presetsList: {
    gap: 10,
    paddingBottom: 10,
  },
  presetItemBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: CinemaColors.border,
    position: 'relative',
  },
  presetItemBtnSelected: {
    borderColor: CinemaColors.primary,
    borderWidth: 2.5,
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetCheckBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 51, 75, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Password Strength */
  labelWithStrengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  strengthBarContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  strengthBarSegment: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  /* Modal Actions */
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: CinemaColors.surface,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  modalCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  modalSubmitBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: CinemaColors.primary,
  },
  modalSubmitBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Delete Modal Specifics */
  deleteModalCard: {
    alignItems: 'center',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  deleteWarningIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: CinemaColors.error,
    marginBottom: 8,
  },
  deleteModalWarningText: {
    fontSize: 12.5,
    color: CinemaColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  deleteConfirmInput: {
    width: 260,
    textAlign: 'center',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  deleteSubmitBtn: {
    backgroundColor: CinemaColors.error,
  },
  deleteSubmitBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
