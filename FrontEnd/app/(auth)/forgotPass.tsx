import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1); // 1: Enter email, 2: OTP & Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let timer: any;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendCode = () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setCountdown(60);
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ mã OTP 4 chữ số');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Thành công', 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.', [
        {
          text: 'Đăng nhập ngay',
          onPress: () => router.push('/(auth)/login' as any),
        },
      ]);
    }, 1200);
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    setCountdown(60);
    Alert.alert('Thông báo', `Mã xác nhận mới đã được gửi lại tới ${email}`);
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
          {/* Ambient Glows */}
          <View style={styles.glowTopRight} />
          <View style={styles.glowBottomLeft} />

          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step === 2) {
                  setStep(1);
                } else {
                  router.back();
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={CinemaColors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.topBrand}>
              <Ionicons name="film" size={18} color={CinemaColors.primary} />
              <Text style={styles.topBrandText}>
                CINE<Text style={{ color: CinemaColors.primary }}>STREAM</Text>
              </Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Icon Badge */}
          <View style={styles.iconBadgeContainer}>
            <View style={styles.iconBadge}>
              <Ionicons
                name={step === 1 ? 'key-outline' : 'shield-checkmark-outline'}
                size={34}
                color={CinemaColors.primary}
              />
            </View>
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              {step === 1 ? 'Quên Mật Khẩu?' : 'Xác Thực & Đặt Lại'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Đừng lo lắng! Hãy nhập email đăng ký để nhận mã OTP thiết lập lại mật khẩu của bạn.'
                : `Mã OTP đã được gửi tới ${email}. Vui lòng nhập mã và thiết lập mật khẩu mới.`}
            </Text>
          </View>

          {/* Step 1: Enter Email */}
          {step === 1 ? (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'email' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={focusedInput === 'email' ? CinemaColors.primary : CinemaColors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập email của bạn"
                    placeholderTextColor={CinemaColors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {email.length > 0 && (
                    <TouchableOpacity onPress={() => setEmail('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name="close-circle" size={18} color={CinemaColors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleSendCode}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={CinemaColors.textPrimary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Gửi Mã Xác Nhận</Text>
                    <Ionicons name="arrow-forward" size={18} color={CinemaColors.textPrimary} style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Step 2: OTP & New Password */
            <View style={styles.formContainer}>
              {/* OTP Inputs */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mã xác nhận (4 số)</Text>
                <View style={styles.otpRow}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        otpInputRefs.current[index] = ref;
                      }}
                      style={[styles.otpBox, digit.length > 0 && styles.otpBoxFilled]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(val, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      textAlign="center"
                    />
                  ))}
                </View>

                {/* Resend Timer */}
                <View style={styles.resendRow}>
                  <Text style={styles.resendText}>Chưa nhận được mã? </Text>
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={countdown > 0}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.resendLink,
                        countdown > 0 && styles.resendLinkDisabled,
                      ]}
                    >
                      {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'newPassword' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={focusedInput === 'newPassword' ? CinemaColors.primary : CinemaColors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu mới"
                    placeholderTextColor={CinemaColors.textMuted}
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onFocus={() => setFocusedInput('newPassword')}
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
              </View>

              {/* Confirm New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'confirmNewPassword' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={focusedInput === 'confirmNewPassword' ? CinemaColors.primary : CinemaColors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor={CinemaColors.textMuted}
                    secureTextEntry={!showPassword}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    onFocus={() => setFocusedInput('confirmNewPassword')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={CinemaColors.textPrimary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Đặt Lại Mật Khẩu</Text>
                    <Ionicons name="checkmark-circle" size={18} color={CinemaColors.textPrimary} style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Nhớ mật khẩu? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Đăng nhập</Text>
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
    paddingTop: 12,
    paddingBottom: 36,
  },
  glowTopRight: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: CinemaColors.glowTopRight,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: 50,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: CinemaColors.glowBottomLeft,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CinemaColors.surfaceSocial,
    borderWidth: 1,
    borderColor: CinemaColors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBrandText: {
    fontSize: 16,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 1.5,
  },
  iconBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: CinemaColors.primaryLight,
    borderWidth: 1.5,
    borderColor: CinemaColors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: CinemaColors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: CinemaColors.textPrimary,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: CinemaColors.surface,
    borderWidth: 1.5,
    borderColor: CinemaColors.border,
    fontSize: 22,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: CinemaColors.borderActive,
    backgroundColor: CinemaColors.surfaceFocused,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  resendText: {
    fontSize: 13,
    color: CinemaColors.textSecondary,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.primary,
  },
  resendLinkDisabled: {
    color: CinemaColors.textMuted,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: CinemaColors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
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
