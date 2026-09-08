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

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Inline Validation Errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
    success?: string;
  }>({});

  // Password strength calculation
  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '', color: CinemaColors.textMuted, score: 0 };
    if (password.length < 8) return { label: 'Yếu (Cần ≥ 8 ký tự)', color: CinemaColors.error, score: 1 };
    if (password.length < 12) return { label: 'Trung bình', color: CinemaColors.warning, score: 2 };
    return { label: 'Mạnh', color: CinemaColors.success, score: 3 };
  };

  const strength = getPasswordStrength();

  const handleRegister = () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const newErrors: typeof errors = {};

    // 1. Kiểm tra Họ và tên
    if (!trimmedName) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    // 2. Kiểm tra Số điện thoại (đầu 0, đủ 10 số)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!trimmedPhone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(trimmedPhone)) {
      newErrors.phone = 'Số điện thoại phải bắt đầu bằng số 0 và đủ 10 chữ số';
    }

    // 3. Kiểm tra Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Email không đúng định dạng (vd: kurumi124@gmail.com)';
    }

    // 4. Kiểm tra Mật khẩu (từ 8 ký tự)
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải có từ 8 ký tự trở lên';
    }

    // 5. Kiểm tra Xác nhận mật khẩu
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu xác nhận';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    // 6. Kiểm tra Đồng ý điều khoản
    if (!agreeTerms) {
      newErrors.agreeTerms = 'Bạn cần đồng ý với Điều khoản sử dụng & Chính sách bảo mật';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Đăng ký thành công
    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      setIsLoading(false);
      setErrors({ success: 'Đăng ký tài khoản thành công! Đang chuyển đến Đăng nhập...' });
      setTimeout(() => {
        router.push('/(auth)/login' as any);
      }, 1200);
    }, 800);
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

          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={CinemaColors.textPrimary} />
            </TouchableOpacity>

            <BrandLogo layout="horizontal" size="small" showTagline={false} />

            <View style={{ width: 40 }} />
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Tạo Tài Khoản Mới</Text>
            <Text style={styles.subtitle}>
              Trải nghiệm hàng ngàn bộ phim 4K đỉnh cao & rạp chiếu tại gia hoàn toàn miễn phí.
            </Text>
          </View>

          {/* Success Banner */}
          {errors.success && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={CinemaColors.success} />
              <Text style={styles.successText}>{errors.success}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'fullName' && styles.inputWrapperFocused,
                  errors.fullName ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={
                    errors.fullName
                      ? CinemaColors.error
                      : focusedInput === 'fullName'
                      ? CinemaColors.primary
                      : CinemaColors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor={CinemaColors.textMuted}
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  onFocus={() => setFocusedInput('fullName')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              {errors.fullName && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                </View>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại (10 số, đầu 0)</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'phone' && styles.inputWrapperFocused,
                  errors.phone ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={
                    errors.phone
                      ? CinemaColors.error
                      : focusedInput === 'phone'
                      ? CinemaColors.primary
                      : CinemaColors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="0987654321"
                  placeholderTextColor={CinemaColors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
                {phone.length === 10 && phone.startsWith('0') && !errors.phone && (
                  <Ionicons name="checkmark-circle" size={18} color={CinemaColors.success} />
                )}
              </View>
              {errors.phone && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{errors.phone}</Text>
                </View>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
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
              </View>
              {errors.email && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Mật khẩu (Tối thiểu 8 ký tự)</Text>
                {strength.label ? (
                  <Text style={[styles.strengthText, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                ) : null}
              </View>
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
                  placeholder="Nhập từ 8 ký tự trở lên"
                  placeholderTextColor={CinemaColors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
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

              {/* Strength bar */}
              {password.length > 0 && (
                <View style={styles.strengthBarContainer}>
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        width:
                          strength.score === 1
                            ? '33%'
                            : strength.score === 2
                            ? '66%'
                            : '100%',
                        backgroundColor: strength.color,
                      },
                    ]}
                  />
                </View>
              )}

              {errors.password && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'confirmPassword' && styles.inputWrapperFocused,
                  errors.confirmPassword ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={
                    errors.confirmPassword
                      ? CinemaColors.error
                      : focusedInput === 'confirmPassword'
                      ? CinemaColors.primary
                      : CinemaColors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor={CinemaColors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
                {confirmPassword.length >= 8 && confirmPassword === password && !errors.confirmPassword && (
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
              {errors.confirmPassword && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                </View>
              )}
            </View>

            {/* Terms Agreement */}
            <TouchableOpacity
              style={styles.termsRow}
              activeOpacity={0.7}
              onPress={() => {
                const next = !agreeTerms;
                setAgreeTerms(next);
                if (next && errors.agreeTerms) {
                  setErrors((prev) => ({ ...prev, agreeTerms: undefined }));
                }
              }}
            >
              <View
                style={[
                  styles.checkbox,
                  agreeTerms && styles.checkboxChecked,
                  errors.agreeTerms ? styles.checkboxError : null,
                ]}
              >
                {agreeTerms && <Ionicons name="checkmark" size={14} color={CinemaColors.textPrimary} />}
              </View>
              <Text style={styles.termsText}>
                Tôi đồng ý với{' '}
                <Text style={styles.termsHighlight}>Điều khoản sử dụng</Text> &{' '}
                <Text style={styles.termsHighlight}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>
            {errors.agreeTerms && (
              <View style={[styles.errorRow, { marginTop: -14, marginBottom: 16 }]}>
                <Ionicons name="alert-circle" size={13} color={CinemaColors.error} />
                <Text style={styles.errorText}>{errors.agreeTerms}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={CinemaColors.textPrimary} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Đăng Ký Tài Khoản</Text>
                  <Ionicons name="arrow-forward" size={18} color={CinemaColors.textPrimary} style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc đăng ký nhanh bằng</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Social */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
                <Ionicons name="logo-google" size={20} color={CinemaColors.google} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
                <Ionicons name="logo-apple" size={20} color={CinemaColors.apple} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
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
    marginBottom: 20,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.textTertiary,
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
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
  strengthBarContainer: {
    height: 4,
    backgroundColor: CinemaColors.border,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: CinemaColors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
    backgroundColor: CinemaColors.surface,
  },
  checkboxChecked: {
    backgroundColor: CinemaColors.primary,
    borderColor: CinemaColors.primary,
  },
  checkboxError: {
    borderColor: CinemaColors.error,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: CinemaColors.textCheckbox,
    lineHeight: 18,
  },
  termsHighlight: {
    color: CinemaColors.primary,
    fontWeight: '600',
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
    marginVertical: 20,
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
    gap: 12,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
