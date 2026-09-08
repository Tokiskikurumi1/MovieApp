import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';
import { BrandLogo } from '@/components/brand-logo';

// Fake test account credentials
const TEST_ACCOUNT = {
  usernames: ['kurumi124@gmail.com', '0987654321'],
  password: 'Kurumi1234@',
};

export default function LoginScreen() {
  const router = useRouter();

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Inline Validation Errors
  const [errors, setErrors] = useState<{ account?: string; password?: string; general?: string }>({});

  const handleLogin = () => {
    const trimmedAccount = account.trim();
    const newErrors: { account?: string; password?: string; general?: string } = {};

    // 1. Kiểm tra để trống
    if (!trimmedAccount) {
      newErrors.account = 'Vui lòng nhập email hoặc số điện thoại';
    }
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. Kiểm tra tài khoản và mật khẩu
    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      setIsLoading(false);

      const isValidUser = TEST_ACCOUNT.usernames.some(
        (u) => u.toLowerCase() === trimmedAccount.toLowerCase()
      );
      const isValidPassword = password === TEST_ACCOUNT.password;

      if (!isValidUser || !isValidPassword) {
        setErrors({
          account: 'Tài khoản hoặc mật khẩu không chính xác',
          password: 'Tài khoản hoặc mật khẩu không chính xác',
        });
        return;
      }

      // Đăng nhập thành công
      router.replace('/(tabs)');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ambient Background Glows */}
          <View style={styles.glowTopRight} />
          <View style={styles.glowBottomLeft} />

          {/* Logo & Brand Header */}
          <BrandLogo layout="vertical" size="medium" showTagline={true} style={{ marginBottom: 20 }} />

          {/* Welcome Text */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Đăng Nhập</Text>
            <Text style={styles.subtitle}>
              Chào mừng bạn trở lại! Hãy đăng nhập để tiếp tục xem phim.
            </Text>
          </View>

          {/* General Hint/Error Box */}
          {errors.general && (
            <View style={styles.generalErrorBox}>
              <Ionicons name="information-circle" size={16} color={CinemaColors.primary} />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Account Input (Email / Phone) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email hoặc Số điện thoại</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'account' && styles.inputWrapperFocused,
                  errors.account ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={
                    errors.account
                      ? CinemaColors.error
                      : focusedInput === 'account'
                      ? CinemaColors.primary
                      : CinemaColors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="kurumi124@gmail.com hoặc 0987654321"
                  placeholderTextColor={CinemaColors.textMuted}
                  autoCapitalize="none"
                  value={account}
                  onChangeText={(val) => {
                    setAccount(val);
                    if (errors.account || errors.general) {
                      setErrors((prev) => ({ ...prev, account: undefined, general: undefined }));
                    }
                  }}
                  onFocus={() => setFocusedInput('account')}
                  onBlur={() => setFocusedInput(null)}
                />
                {account.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setAccount('');
                      setErrors((prev) => ({ ...prev, account: undefined }));
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={18} color={CinemaColors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              {errors.account && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{errors.account}</Text>
                </View>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'password' && styles.inputWrapperFocused,
                  errors.password ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    errors.password
                      ? CinemaColors.error
                      : focusedInput === 'password'
                      ? CinemaColors.primary
                      : CinemaColors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu (Kurumi1234@)"
                  placeholderTextColor={CinemaColors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errors.password || errors.general) {
                      setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
                    }
                  }}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={CinemaColors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              )}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                activeOpacity={0.7}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color={CinemaColors.textPrimary} />}
                </View>
                <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgotPass' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Login Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={CinemaColors.textPrimary} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Đăng Nhập</Text>
                  <Ionicons name="arrow-forward" size={18} color={CinemaColors.textPrimary} style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc đăng nhập bằng</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
                <Ionicons name="logo-google" size={20} color={CinemaColors.google} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
                <Ionicons name="logo-apple" size={20} color={CinemaColors.apple} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
                <Ionicons name="logo-facebook" size={20} color={CinemaColors.facebook} />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Guest Browsing */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.7}
            >
              <Text style={styles.guestButtonText}>Khám phá với tư cách Khách</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CinemaColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
  },
  glowTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: CinemaColors.glowTopRight,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: 60,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: CinemaColors.glowBottomLeft,
  },
  headerSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: CinemaColors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  generalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 75, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  generalErrorText: {
    fontSize: 12,
    color: CinemaColors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.textTertiary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CinemaColors.surface,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: CinemaColors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: CinemaColors.borderActive,
    backgroundColor: CinemaColors.surfaceFocused,
  },
  inputWrapperError: {
    borderColor: CinemaColors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: CinemaColors.error,
    fontWeight: '500',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: CinemaColors.textPrimary,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: CinemaColors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: CinemaColors.surface,
  },
  checkboxChecked: {
    backgroundColor: CinemaColors.primary,
    borderColor: CinemaColors.primary,
  },
  rememberMeText: {
    fontSize: 13,
    color: CinemaColors.textCheckbox,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.primary,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: CinemaColors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CinemaColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: CinemaColors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: CinemaColors.textDivider,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: CinemaColors.surfaceSocial,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CinemaColors.borderLight,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.textTertiary,
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  guestButtonText: {
    fontSize: 13,
    color: CinemaColors.textGuest,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: CinemaColors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: CinemaColors.primary,
  },
});
