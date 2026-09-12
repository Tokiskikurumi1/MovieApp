import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: string;
  originalPrice?: string;
  discountBadge?: string;
  isPopular?: boolean;
  features: string[];
}

interface TransactionItem {
  id: string;
  code: string;
  planName: string;
  amount: string;
  paymentMethod: string;
  paymentIcon: keyof typeof Ionicons.glyphMap;
  date: string;
  status: 'success' | 'pending' | 'failed';
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-1m',
    name: 'Gói 1 Tháng',
    duration: '30 ngày',
    price: '69.000đ',
    originalPrice: '89.000đ',
    discountBadge: '-22%',
    features: ['Chất lượng 4K Ultra HD', 'Không quảng cáo', 'Tải 50 tập phim', 'Phát 2 thiết bị'],
  },
  {
    id: 'plan-6m',
    name: 'Gói 6 Tháng VIP',
    duration: '180 ngày',
    price: '349.000đ',
    originalPrice: '450.000đ',
    discountBadge: 'Phổ biến nhất • Tiết kiệm 25%',
    isPopular: true,
    features: [
      'Chất lượng 4K Ultra HD + HDR10',
      'Âm thanh vòm Dolby Atmos',
      'Không quảng cáo 100%',
      'Tải không giới hạn',
      'Phát 4 thiết bị cùng lúc',
      'Xem trước tập mới độc quyền',
    ],
  },
  {
    id: 'plan-12m',
    name: 'Gói 1 Năm Siêu Cấp',
    duration: '365 ngày + Tặng 30 ngày',
    price: '649.000đ',
    originalPrice: '950.000đ',
    discountBadge: 'Tiết kiệm 35% + Tặng 1 tháng',
    features: [
      'Tất cả đặc quyền VIP 4K',
      'Tặng 30 ngày VIP miễn phí',
      'Huy hiệu thành viên Vàng',
      'Ưu tiên hỗ trợ kỹ thuật 24/7',
      'Xem rạp phim trực tuyến sớm nhất',
    ],
  },
];

const TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx-1',
    code: 'CINE-2026-8891',
    planName: 'Gói 6 Tháng VIP 4K',
    amount: '349.000đ',
    paymentMethod: 'Ví MoMo',
    paymentIcon: 'wallet-outline',
    date: '28/06/2026 14:22',
    status: 'success',
  },
  {
    id: 'tx-2',
    code: 'CINE-2025-4421',
    planName: 'Gói 1 Năm Siêu Cấp',
    amount: '649.000đ',
    paymentMethod: 'Thẻ Visa / Mastercard (•••• 8839)',
    paymentIcon: 'card-outline',
    date: '28/06/2025 09:15',
    status: 'success',
  },
  {
    id: 'tx-3',
    code: 'CINE-2024-1102',
    planName: 'Gói 1 Tháng Thử Nghiệm',
    amount: '69.000đ',
    paymentMethod: 'ZaloPay',
    paymentIcon: 'phone-portrait-outline',
    date: '15/05/2024 20:30',
    status: 'success',
  },
];

export default function BillingSubscriptionScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'momo' | 'zalopay' | 'card' | 'apple'>('momo');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  const handleOpenPayment = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsPaymentModalVisible(true);
  };

  const handleConfirmPayment = () => {
    setIsPaymentModalVisible(false);
    Alert.alert(
      'Thanh toán thành công! 🎉',
      `Bạn đã đăng ký thành công ${selectedPlan?.name}. Thời hạn gói VIP đã được cập nhật tự động.`,
      [{ text: 'Tuyệt vời', onPress: () => {} }]
    );
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
        <Text style={styles.headerTitle}>Gói Cước & Thanh Toán</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Segment Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'plans' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('plans')}
        >
          <Ionicons
            name="sparkles"
            size={16}
            color={activeTab === 'plans' ? '#FFFFFF' : CinemaColors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'plans' && styles.tabTextActive]}>
            Gói Cước VIP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="receipt-outline"
            size={16}
            color={activeTab === 'history' ? '#FFFFFF' : CinemaColors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Lịch Sử Giao Dịch
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Plan Overview Card */}
        <View style={styles.activePlanCard}>
          <View style={styles.activePlanHeader}>
            <View style={styles.activePlanBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FFD700" />
              <Text style={styles.activePlanBadgeText}>ĐANG HOẠT ĐỘNG</Text>
            </View>
            <Text style={styles.activePlanStatus}>Tự động gia hạn</Text>
          </View>

          <Text style={styles.activePlanTitle}>Gói VIP 4K Siêu Cấp</Text>
          <Text style={styles.activePlanExpiry}>
            Hạn dùng đến: <Text style={styles.expiryHighlight}>28/12/2026</Text> (Còn 108 ngày)
          </Text>

          <View style={styles.activePlanPerksGrid}>
            <View style={styles.perkItem}>
              <Ionicons name="checkmark-circle" size={15} color="#10B981" />
              <Text style={styles.perkText}>4K HDR & Dolby Atmos</Text>
            </View>
            <View style={styles.perkItem}>
              <Ionicons name="checkmark-circle" size={15} color="#10B981" />
              <Text style={styles.perkText}>Không quảng cáo</Text>
            </View>
            <View style={styles.perkItem}>
              <Ionicons name="checkmark-circle" size={15} color="#10B981" />
              <Text style={styles.perkText}>4 Thiết bị cùng lúc</Text>
            </View>
            <View style={styles.perkItem}>
              <Ionicons name="checkmark-circle" size={15} color="#10B981" />
              <Text style={styles.perkText}>Tải phim Offline</Text>
            </View>
          </View>
        </View>

        {activeTab === 'plans' ? (
          /* ========================================================= */
          /* TAB 1: DANH SÁCH GÓI CƯỚC VIP                             */
          /* ========================================================= */
          <View style={styles.plansSection}>
            <Text style={styles.sectionHeading}>CÁC GÓI GIA HẠN & NÂNG CẤP</Text>

            {PLANS.map((plan) => (
              <View
                key={plan.id}
                style={[styles.planCard, plan.isPopular && styles.planCardPopular]}
              >
                {plan.discountBadge && (
                  <View style={[styles.planBadge, plan.isPopular && styles.planBadgePopular]}>
                    <Text style={styles.planBadgeText}>{plan.discountBadge}</Text>
                  </View>
                )}

                <View style={styles.planHeaderRow}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDuration}>{plan.duration}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    {plan.originalPrice && (
                      <Text style={styles.planOriginalPrice}>{plan.originalPrice}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.planDivider} />

                {/* Features List */}
                <View style={styles.featuresList}>
                  {plan.features.map((feat, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Ionicons name="sparkles" size={13} color={CinemaColors.primary} />
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {/* Subscribe Button */}
                <TouchableOpacity
                  style={[styles.subscribeBtn, plan.isPopular && styles.subscribeBtnPopular]}
                  activeOpacity={0.85}
                  onPress={() => handleOpenPayment(plan)}
                >
                  <Text style={styles.subscribeBtnText}>
                    {plan.isPopular ? 'Gia Hạn Gói Này Ngay' : 'Chọn Gói Này'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Payment security note */}
            <View style={styles.securityNote}>
              <Ionicons name="lock-closed" size={16} color={CinemaColors.textMuted} />
              <Text style={styles.securityNoteText}>
                Thanh toán bảo mật chuẩn quốc tế SSL 256-bit. Hỗ trợ hoàn tiền trong 7 ngày nếu không hài lòng.
              </Text>
            </View>
          </View>
        ) : (
          /* ========================================================= */
          /* TAB 2: LỊCH SỬ GIAO DỊCH                                  */
          /* ========================================================= */
          <View style={styles.historySection}>
            <Text style={styles.sectionHeading}>LỊCH SỬ THANH TOÁN GẦN ĐÂY</Text>

            {TRANSACTIONS.map((tx) => (
              <TouchableOpacity
                key={tx.id}
                style={styles.txCard}
                activeOpacity={0.75}
                onPress={() => setSelectedTx(tx)}
              >
                <View style={styles.txIconCircle}>
                  <Ionicons name={tx.paymentIcon} size={20} color={CinemaColors.primary} />
                </View>

                <View style={styles.txInfo}>
                  <Text style={styles.txPlanName}>{tx.planName}</Text>
                  <Text style={styles.txCode}>Mã: {tx.code}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>

                <View style={styles.txAmountCol}>
                  <Text style={styles.txAmount}>{tx.amount}</Text>
                  <View style={styles.txStatusBadge}>
                    <Text style={styles.txStatusText}>Thành công</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ============================================================= */}
      {/* MODAL: CHỌN PHƯƠNG THỨC THANH TOÁN (PAYMENT MODAL)            */}
      {/* ============================================================= */}
      <Modal
        visible={isPaymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPaymentModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPaymentModalVisible(false)}
        >
          <View style={styles.paymentModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác Nhận Thanh Toán</Text>
              <TouchableOpacity
                onPress={() => setIsPaymentModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color={CinemaColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedPlan && (
              <View style={styles.modalPlanSummary}>
                <View>
                  <Text style={styles.modalPlanName}>{selectedPlan.name}</Text>
                  <Text style={styles.modalPlanDuration}>Thời hạn: {selectedPlan.duration}</Text>
                </View>
                <Text style={styles.modalPlanPrice}>{selectedPlan.price}</Text>
              </View>
            )}

            <Text style={styles.paymentMethodHeading}>CHỌN PHƯƠNG THỨC THANH TOÁN</Text>

            {/* Payment Methods */}
            {[
              { id: 'momo', name: 'Ví Điện Tử MoMo', icon: 'wallet-outline', badge: 'Khuyên dùng' },
              { id: 'zalopay', name: 'Ví ZaloPay', icon: 'phone-portrait-outline' },
              { id: 'card', name: 'Thẻ Quốc Tế Visa / Mastercard / JCB', icon: 'card-outline' },
              { id: 'apple', name: 'Apple Pay / Google Pay', icon: 'logo-apple' },
            ].map((method) => {
              const isSelected = selectedPaymentMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.paymentMethodRow, isSelected && styles.paymentMethodRowActive]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPaymentMethod(method.id as any)}
                >
                  <View style={styles.methodLeft}>
                    <View style={[styles.methodIconBox, isSelected && styles.methodIconBoxActive]}>
                      <Ionicons
                        name={method.icon as any}
                        size={20}
                        color={isSelected ? CinemaColors.primary : CinemaColors.textSecondary}
                      />
                    </View>
                    <View>
                      <Text style={[styles.methodName, isSelected && styles.methodNameActive]}>
                        {method.name}
                      </Text>
                      {method.badge && <Text style={styles.methodBadge}>{method.badge}</Text>}
                    </View>
                  </View>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? CinemaColors.primary : CinemaColors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}

            {/* Confirm Payment Button */}
            <TouchableOpacity
              style={styles.confirmPayBtn}
              activeOpacity={0.85}
              onPress={handleConfirmPayment}
            >
              <Text style={styles.confirmPayText}>Thanh Toán Ngay</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ============================================================= */}
      {/* MODAL: CHI TIẾT HÓA ĐƠN GIAO DỊCH                            */}
      {/* ============================================================= */}
      <Modal
        visible={!!selectedTx}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTx(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedTx(null)}
        >
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View style={styles.receiptSuccessBadge}>
                <Ionicons name="checkmark-circle" size={36} color="#10B981" />
              </View>
              <Text style={styles.receiptTitle}>Hóa Đơn Điện Tử</Text>
              <Text style={styles.receiptSubtitle}>Thanh toán thành công</Text>
            </View>

            {selectedTx && (
              <View style={styles.receiptDetails}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Mã hóa đơn</Text>
                  <Text style={styles.receiptValueBold}>{selectedTx.code}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Gói dịch vụ</Text>
                  <Text style={styles.receiptValue}>{selectedTx.planName}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Thời gian</Text>
                  <Text style={styles.receiptValue}>{selectedTx.date}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Hình thức</Text>
                  <Text style={styles.receiptValue}>{selectedTx.paymentMethod}</Text>
                </View>
                <View style={styles.receiptDivider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptTotalLabel}>Tổng số tiền</Text>
                  <Text style={styles.receiptTotalValue}>{selectedTx.amount}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeReceiptBtn}
              activeOpacity={0.8}
              onPress={() => setSelectedTx(null)}
            >
              <Text style={styles.closeReceiptText}>Đóng</Text>
            </TouchableOpacity>
          </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    backgroundColor: CinemaColors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: CinemaColors.primary,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: CinemaColors.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },

  /* Active Plan Card */
  activePlanCard: {
    backgroundColor: '#1E1B18',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activePlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  activePlanBadgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activePlanStatus: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '600',
  },
  activePlanTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activePlanExpiry: {
    fontSize: 13,
    color: CinemaColors.textSecondary,
    marginBottom: 14,
  },
  expiryHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },
  activePlanPerksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: 6,
  },
  perkText: {
    fontSize: 12,
    color: CinemaColors.textPrimary,
    fontWeight: '500',
  },

  /* Plans Section */
  plansSection: {
    gap: 16,
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: CinemaColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  planCard: {
    backgroundColor: CinemaColors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardPopular: {
    borderColor: CinemaColors.primary,
    backgroundColor: '#191316',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: CinemaColors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  planBadgePopular: {
    backgroundColor: CinemaColors.primary,
  },
  planBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  planName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  planDuration: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: CinemaColors.primary,
  },
  planOriginalPrice: {
    fontSize: 11.5,
    color: CinemaColors.textMuted,
    textDecorationLine: 'line-through',
  },
  planDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 14,
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12.5,
    color: CinemaColors.textSecondary,
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CinemaColors.surfaceElevated,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  subscribeBtnPopular: {
    backgroundColor: CinemaColors.primary,
  },
  subscribeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: CinemaColors.surface,
    borderRadius: 12,
    marginTop: 8,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 11.5,
    color: CinemaColors.textMuted,
    lineHeight: 16,
  },

  /* History Section */
  historySection: {
    gap: 12,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CinemaColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    gap: 12,
  },
  txIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txPlanName: {
    fontSize: 14,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 2,
  },
  txCode: {
    fontSize: 11.5,
    color: CinemaColors.textMuted,
    marginBottom: 2,
  },
  txDate: {
    fontSize: 11,
    color: CinemaColors.textSecondary,
  },
  txAmountCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 14.5,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
  },
  txStatusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  txStatusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  paymentModalCard: {
    backgroundColor: CinemaColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
  },
  modalPlanSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CinemaColors.surfaceElevated,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalPlanName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalPlanDuration: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
  },
  modalPlanPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: CinemaColors.primary,
  },
  paymentMethodHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: CinemaColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: CinemaColors.surfaceElevated,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentMethodRowActive: {
    borderColor: CinemaColors.primary,
    backgroundColor: 'rgba(255, 51, 75, 0.08)',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconBoxActive: {
    backgroundColor: 'rgba(255, 51, 75, 0.15)',
  },
  methodName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  methodNameActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  methodBadge: {
    fontSize: 10,
    color: CinemaColors.primary,
    fontWeight: '700',
  },
  confirmPayBtn: {
    backgroundColor: CinemaColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmPayText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  /* Receipt Modal */
  receiptCard: {
    margin: 20,
    backgroundColor: CinemaColors.surface,
    borderRadius: 20,
    padding: 24,
    alignSelf: 'center',
    width: '90%',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  receiptSuccessBadge: {
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  receiptSubtitle: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  receiptDetails: {
    backgroundColor: CinemaColors.surfaceElevated,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: 12.5,
    color: CinemaColors.textMuted,
  },
  receiptValue: {
    fontSize: 12.5,
    color: CinemaColors.textPrimary,
    fontWeight: '500',
  },
  receiptValueBold: {
    fontSize: 12.5,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  receiptTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: CinemaColors.primary,
  },
  closeReceiptBtn: {
    backgroundColor: CinemaColors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  closeReceiptText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
