import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';
import { UserAPI } from '@/services/API';

export interface ReportTargetComment {
  id: string | number;
  user?: string;
  content?: string;
}

interface ReportCommentModalProps {
  visible: boolean;
  comment: ReportTargetComment | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Nội dung phản cảm, thô tục hoặc xúc phạm', icon: 'hand-left-outline' },
  { id: 'spoiler', label: 'Tiết lộ trước nội dung phim (Spoil)', icon: 'film-outline' },
  { id: 'spam', label: 'Spam, quảng cáo hoặc liên kết độc hại', icon: 'megaphone-outline' },
  { id: 'harassment', label: 'Quấy rối hoặc công kích cá nhân', icon: 'alert-circle-outline' },
  { id: 'misinformation', label: 'Thông tin sai lệch hoặc gây hiểu lầm', icon: 'information-circle-outline' },
  { id: 'other', label: 'Lý do khác', icon: 'ellipsis-horizontal-circle-outline' },
];

export function ReportCommentModal({
  visible,
  comment,
  onClose,
  onSuccess,
}: ReportCommentModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].label);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    if (isSubmitting) return;
    setIsSubmittedSuccess(false);
    setSelectedReason(REPORT_REASONS[0].label);
    setDetails('');
    setErrorMessage('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!comment?.id) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await UserAPI.reportComment(comment.id, selectedReason, details);
      if (res && res.success !== false) {
        setIsSubmittedSuccess(true);
        onSuccess?.();
      } else {
        setErrorMessage(res?.message || 'Không thể gửi báo cáo. Vui lòng thử lại sau.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi gửi báo cáo vi phạm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {isSubmittedSuccess ? (
              /* ======================= SUCCESS SCREEN ======================= */
              <View style={styles.successWrapper}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={38} color="#FFFFFF" />
                </View>
                <Text style={styles.successTitle}>Báo cáo thành công!</Text>
                <Text style={styles.successDescription}>
                  Cảm ơn bạn đã phản hồi. Đội ngũ kiểm duyệt CINESTREAM đã tiếp nhận và sẽ xử lý bình luận này trong thời gian sớm nhất để giữ gìn cộng đồng văn minh.
                </Text>

                <TouchableOpacity
                  style={styles.successButton}
                  onPress={handleClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.successButtonText}>Đã hiểu</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ======================= REPORT FORM ======================= */
              <>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerTitleRow}>
                    <View style={styles.headerIconWrapper}>
                      <Ionicons name="alert-circle-outline" size={20} color={CinemaColors.primary} />
                    </View>
                    <View>
                      <Text style={styles.headerTitle}>Báo cáo bình luận</Text>
                      <Text style={styles.headerSubtitle}>Chọn lý do bạn muốn báo cáo vi phạm</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={handleClose}
                    disabled={isSubmitting}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={20} color={CinemaColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Target Comment Preview Snippet */}
                {comment && (
                  <View style={styles.commentSnippetBox}>
                    <Text style={styles.commentAuthorName} numberOfLines={1}>
                      {comment.user || 'Người dùng'}
                    </Text>
                    <Text style={styles.commentSnippetText} numberOfLines={2}>
                      "{comment.content || 'Nội dung bình luận'}"
                    </Text>
                  </View>
                )}

                <ScrollView
                  style={styles.scrollArea}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Reasons Radio List */}
                  <Text style={styles.sectionLabel}>Lý do báo cáo:</Text>
                  <View style={styles.reasonsList}>
                    {REPORT_REASONS.map((r) => {
                      const isSelected = selectedReason === r.label;
                      return (
                        <TouchableOpacity
                          key={r.id}
                          style={[
                            styles.reasonRow,
                            isSelected && styles.reasonRowSelected,
                          ]}
                          activeOpacity={0.7}
                          onPress={() => setSelectedReason(r.label)}
                        >
                          <View style={styles.reasonLeft}>
                            <Ionicons
                              name={r.icon as any}
                              size={18}
                              color={isSelected ? CinemaColors.primary : CinemaColors.textMuted}
                            />
                            <Text
                              style={[
                                styles.reasonText,
                                isSelected && styles.reasonTextSelected,
                              ]}
                            >
                              {r.label}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInnerDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Extra Details Input */}
                  <Text style={styles.sectionLabel}>Chi tiết bổ sung (tùy chọn):</Text>
                  <TextInput
                    style={styles.detailsInput}
                    placeholder="Mô tả cụ thể hơn để hỗ trợ quản trị viên duyệt nhanh hơn..."
                    placeholderTextColor={CinemaColors.textMuted}
                    multiline
                    numberOfLines={3}
                    value={details}
                    onChangeText={setDetails}
                    maxLength={300}
                  />

                  {errorMessage ? (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle" size={15} color={CinemaColors.error} />
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                  ) : null}
                </ScrollView>

                {/* Footer Action Buttons */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="paper-plane" size={15} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: CinemaColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CinemaColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.primaryBorder,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: CinemaColors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CinemaColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Snippet */
  commentSnippetBox: {
    backgroundColor: CinemaColors.surfaceElevated,
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: CinemaColors.primary,
    marginBottom: 14,
  },
  commentAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 2,
  },
  commentSnippetText: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    fontStyle: 'italic',
  },

  scrollArea: {
    maxHeight: 320,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },

  /* Reasons List */
  reasonsList: {
    gap: 8,
    marginBottom: 14,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: CinemaColors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonRowSelected: {
    borderColor: CinemaColors.primary,
    backgroundColor: 'rgba(255, 51, 75, 0.08)',
  },
  reasonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  reasonText: {
    fontSize: 13,
    color: CinemaColors.textSecondary,
    flexShrink: 1,
  },
  reasonTextSelected: {
    color: CinemaColors.textPrimary,
    fontWeight: '600',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: CinemaColors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: CinemaColors.primary,
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CinemaColors.primary,
  },

  /* Extra details input */
  detailsInput: {
    backgroundColor: CinemaColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    padding: 10,
    color: CinemaColors.textPrimary,
    fontSize: 12.5,
    minHeight: 64,
    textAlignVertical: 'top',
    marginBottom: 12,
  },

  /* Error Box */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 11.5,
    color: CinemaColors.error,
    flex: 1,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CinemaColors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: CinemaColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.textSecondary,
  },
  submitButton: {
    flex: 1.4,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: CinemaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Success Screen */
  successWrapper: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: CinemaColors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: CinemaColors.success,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: CinemaColors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  successDescription: {
    fontSize: 13,
    color: CinemaColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: CinemaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
