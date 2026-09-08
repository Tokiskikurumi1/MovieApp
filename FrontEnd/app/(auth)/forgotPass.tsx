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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';
import { BrandLogo } from '@/components/brand-logo';

// Fake Test OTP constant
const TEST_OTP = '1111';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // 1: Enter email, 2: Enter OTP, 3: Set new password
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Inline Validation Errors
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    resendInfo?: string;
    success?: string;
  }>({});

  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Step 1: Send OTP to Email
  const handleSendCode = () => {
    const trimmedEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!trimmedEmail) {
      setErrors({ email: 'Vui lòng nhập địa chỉ email của bạn' });
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setErrors({ email: 'Email không đúng định dạng (vd: kurumi124@gmail.com)' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setCountdown(60);
      setOtp(['', '', '', '']);
    }, 600);
  };

  // OTP Change handler
  const handleOtpChange = (value: string, index: number) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: undefined }));
    }

    // Auto focus next input if character entered
    if (cleaned && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP Backspace key handling
  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 4) {
      setErrors({ otp: 'Vui lòng nhập đủ 4 chữ số mã OTP' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      setIsLoading(false);

      if (enteredOtp !== TEST_OTP) {
        setErrors({ otp: `Mã OTP không chính xác. Vui lòng nhập lại` });
        return;
      }

      // OTP chính xác -> Chuyển sang Bước 3
      setStep(3);
    }, 500);
  };

  // Step 3: Save New Password
  const handleResetPassword = () => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu mới phải có từ 8 ký tự trở lên';
    }

    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = 'Vui lòng nhập lại mật khẩu xác nhận';
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      setIsLoading(false);
      setErrors({ success: 'Đặt lại mật khẩu thành công! Đang chuyển về Đăng nhập...' });
      setTimeout(() => {
        router.push('/(auth)/login' as any);
      }, 1200);
    }, 800);
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    setCountdown(60);
    setErrors((prev) => ({
      ...prev,
      resendInfo: `Mã mới đã được gửi lại tới ${email}. (Mã test: ${TEST_OTP})`,
      otp: undefined,
    }));
  };

  const handleBack = () => {
    setErrors({});
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
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
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={CinemaColors.textPrimary} />
            </TouchableOpacity>

            <BrandLogo layout="horizontal" size="small" showTagline={false} />

            <View style={{ width: 40 }} />
          </View>

          {/* Step Indicator Badges */}
          <View style={styles.stepIndicatorContainer}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step === 3 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 3 && styles.stepDotActive]} />
          </View>

          {/* Icon Badge */}
          <View style={styles.iconBadgeContainer}>
            <View style={styles.iconBadge}>
              <Ionicons
                name={
                  step === 1
                    ? 'mail-outline'
                    : step === 2
                    ? 'shield-checkmark-outline'
                    : 'key-outline'
                }
                size={34}
                color={CinemaColors.primary}
              />
            </View>
          </View>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              {step === 1
                ? 'Quên Mật Khẩu?'
                : step === 2
                ? 'Xác Thực Mã OTP'
                : 'Tạo Mật Khẩu Mới'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi mã OTP 4 số để đặt lại mật khẩu.'
                : step === 2
                ? `Mã OTP gồm 4 số đã được gửi tới ${email}. Vui lòng nhập mã để tiếp tục (Mã test: 1111).`
                : 'Vui lòng nhập mật khẩu mới (≥ 8 ký tự) và xác nhận để hoàn tất.'}
            </Text>
          </View>

          {/* Success Box */}
          {errors.success && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={CinemaColors.success} />
              <Text style={styles.successText}>{errors.success}</Text>
            </View>
          )}

          {/* ----------------- STEP 1: NHẬP EMAIL ----------------- */}
          {step === 1 && (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'email' && styles.inputWrapperFocused,
                    errors.email ? styles.inputWrapperError : null,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={
                      errors.email
                        ? CinemaColors.error
                        : focusedInput === 'email'
                        ? CinemaColors.primary
                        : CinemaColors.textMuted
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="kurumi124@gmail.com"
                    placeholderTextColor={CinemaColors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {email.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setEmail('');
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={18} color={CinemaColors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
                {errors.email && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </View>
                )}
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
          )}

          {/* ----------------- STEP 2: NHẬP MÃ OTP ----------------- */}
          {step === 2 && (
            <View style={styles.formContainer}>
              <View style={styles.otpSection}>
                <Text style={styles.inputLabelCentered}>Nhập mã OTP 4 số (Mã test: 1111)</Text>

                {/* 4 Formatted OTP Boxes */}
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        otpInputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpBox,
                        digit.length > 0 && styles.otpBoxFilled,
                        errors.otp ? styles.otpBoxError : null,
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(val, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {/* OTP Error Message */}
                {errors.otp && (
                  <View style={[styles.errorRow, { justifyContent: 'center', marginTop: 10 }]}>
                    <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                    <Text style={styles.errorText}>{errors.otp}</Text>
                  </View>
                )}

                {/* Resend Info Message */}
                {errors.resendInfo && (
                  <View style={[styles.infoRow, { justifyContent: 'center', marginTop: 10 }]}>
                    <Ionicons name="information-circle" size={13} color={CinemaColors.primary} />
                    <Text style={styles.infoText}>{errors.resendInfo}</Text>
                  </View>
                )}

                {/* Resend Countdown */}
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

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={CinemaColors.textPrimary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Xác Nhận Mã OTP</Text>
                    <Ionicons name="shield-checkmark" size={18} color={CinemaColors.textPrimary} style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ----------------- STEP 3: ĐẶT LẠI MẬT KHẨU MỚI ----------------- */}
          {step === 3 && (
            <View style={styles.formContainer}>
              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu mới (Tối thiểu 8 ký tự)</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'newPassword' && styles.inputWrapperFocused,
                    errors.newPassword ? styles.inputWrapperError : null,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      errors.newPassword
                        ? CinemaColors.error
                        : focusedInput === 'newPassword'
                        ? CinemaColors.primary
                        : CinemaColors.textMuted
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập từ 8 ký tự trở lên"
                    placeholderTextColor={CinemaColors.textMuted}
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={(val) => {
                      setNewPassword(val);
                      if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }}
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
                {errors.newPassword && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                    <Text style={styles.errorText}>{errors.newPassword}</Text>
                  </View>
                )}
              </View>

              {/* Confirm New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'confirmNewPassword' && styles.inputWrapperFocused,
                    errors.confirmNewPassword ? styles.inputWrapperError : null,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={
                      errors.confirmNewPassword
                        ? CinemaColors.error
                        : focusedInput === 'confirmNewPassword'
                        ? CinemaColors.primary
                        : CinemaColors.textMuted
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor={CinemaColors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmNewPassword}
                    onChangeText={(val) => {
                      setConfirmNewPassword(val);
                      if (errors.confirmNewPassword) {
                        setErrors((prev) => ({ ...prev, confirmNewPassword: undefined }));
                      }
                    }}
                    onFocus={() => setFocusedInput('confirmNewPassword')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {confirmNewPassword.length >= 8 && confirmNewPassword === newPassword && !errors.confirmNewPassword && (
                    <Ionicons name="checkmark-circle" size={20} color={CinemaColors.success} style={{ marginRight: 6 }} />
                  )}
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={CinemaColors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmNewPassword && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                    <Text style={styles.errorText}>{errors.confirmNewPassword}</Text>
                  </View>
                )}
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
                    <Text style={styles.primaryButtonText}>Lưu Mật Khẩu Mới</Text>
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
    marginBottom: 16,
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
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CinemaColors.borderLight,
  },
  stepDotActive: {
    backgroundColor: CinemaColors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 28,
    height: 2,
    backgroundColor: CinemaColors.borderLight,
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: CinemaColors.primary,
  },
  iconBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: CinemaColors.primaryLight,
    borderWidth: 1.5,
    borderColor: CinemaColors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    gap: 8,
  },
  successText: {
    fontSize: 13,
    color: CinemaColors.success,
    fontWeight: '600',
    flex: 1,
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
  inputLabelCentered: {
    fontSize: 14,
    fontWeight: '600',
    color: CinemaColors.textTertiary,
    textAlign: 'center',
    marginBottom: 14,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 12,
    color: CinemaColors.primary,
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
  otpSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  otpBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: CinemaColors.surface,
    borderWidth: 1.5,
    borderColor: CinemaColors.border,
    fontSize: 24,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: CinemaColors.borderActive,
    backgroundColor: CinemaColors.surfaceFocused,
  },
  otpBoxError: {
    borderColor: CinemaColors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
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
    marginTop: 4,
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
