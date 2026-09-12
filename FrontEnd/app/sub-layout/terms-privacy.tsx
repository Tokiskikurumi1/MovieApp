import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';

export default function TermsPrivacyScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

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
        <Text style={styles.headerTitle}>Điều Khoản & Bảo Mật</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'terms' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('terms')}
        >
          <Ionicons
            name="document-text-outline"
            size={16}
            color={activeTab === 'terms' ? '#FFFFFF' : CinemaColors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
            Điều Khoản Sử Dụng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'privacy' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('privacy')}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={activeTab === 'privacy' ? '#FFFFFF' : CinemaColors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
            Chính Sách Bảo Mật
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.lastUpdatedText}>Cập nhật lần cuối: 01/01/2026 • Phiên bản 2.4.0</Text>

        {activeTab === 'terms' ? (
          /* ========================================================= */
          /* TAB 1: ĐIỀU KHOẢN DỊCH VỤ                                 */
          /* ========================================================= */
          <View style={styles.contentSection}>
            {/* Section 1 */}
            <View style={styles.legalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="film-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.cardTitle}>1. Giới Thiệu & Chấp Thuận</Text>
              </View>
              <Text style={styles.legalParagraph}>
                Chào mừng bạn đến với <Text style={styles.boldText}>CINESTREAM</Text> - Nền tảng phát trực tuyến phim điện ảnh và anime bản quyền chuẩn 4K HDR. Khi truy cập và sử dụng ứng dụng, bạn đồng ý tuân thủ toàn bộ các điều khoản và điều kiện quy định dưới đây.
              </Text>
            </View>

            {/* Section 2 */}
            <View style={styles.legalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="key-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.cardTitle}>2. Đăng Ký & Bảo Mật Tài Khoản</Text>
              </View>
              <Text style={styles.legalParagraph}>
                • Bạn chịu trách nhiệm duy trì tính bảo mật của mật khẩu và thông tin đăng nhập của mình.{'\n'}
                • Mỗi tài khoản VIP cho phép xem tối đa trên 4 thiết bị đồng thời.{'\n'}
                • Nghiêm cấm hành vi bán lại tài khoản, cho thuê hoặc phát tán trái phép luồng video.
              </Text>
            </View>

            {/* Section 3 */}
            <View style={styles.legalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="ribbon-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.cardTitle}>3. Bản Quyền & Sở Hữu Trí Tuệ</Text>
              </View>
              <Text style={styles.legalParagraph}>
                Toàn bộ nội dung phim, video, phụ đề, âm thanh, logo và hình ảnh hiển thị trên CINESTREAM thuộc sở hữu hợp pháp của CINESTREAM hoặc các nhà sản xuất/đối tác cấp phép. Người dùng không được sao chép, trích xuất (rip), chỉnh sửa hoặc khai thác thương mại dưới bất kỳ hình thức nào.
              </Text>
            </View>

            {/* Section 4 */}
            <View style={styles.legalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="card-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.cardTitle}>4. Gói Cước & Chính Sách Hoàn Tiền</Text>
              </View>
              <Text style={styles.legalParagraph}>
                • Phí dịch vụ VIP được thanh toán trước theo từng chu kỳ (1 tháng, 6 tháng, 1 năm).{'\n'}
                • Chúng tôi áp dụng chính sách hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu dịch vụ không đáp ứng cam kết hoặc xảy ra sự cố kỹ thuật nghiêm trọng.
              </Text>
            </View>

            {/* Section 5 */}
            <View style={styles.legalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={CinemaColors.primary} />
                </View>
                <Text style={styles.cardTitle}>5. Quy Tắc Ứng Xử & Bình Luận</Text>
              </View>
              <Text style={styles.legalParagraph}>
                Người dùng cam kết giữ văn hóa bình luận văn minh: không spam, không xúc phạm người khác, không spoil tình tiết cốt truyện làm ảnh hưởng đến trải nghiệm của cộng đồng người xem.
              </Text>
            </View>
          </View>
        ) : (
          /* ========================================================= */
          /* TAB 2: CHÍNH SÁCH BẢO MẬT                                 */
          /* ========================================================= */
          <View style={styles.contentSection}>
            {/* Privacy Section 1 */}
            <View style={styles.legalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="person-circle-outline" size={18} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>1. Thông Tin Chúng Tôi Thu Thập</Text>
              </View>
              <Text style={styles.legalParagraph}>
                • <Text style={styles.boldText}>Thông tin cá nhân:</Text> Họ tên, địa chỉ email, số điện thoại, ảnh đại diện khi bạn đăng ký.{'\n'}
                • <Text style={styles.boldText}>Lịch sử xem & Sở thích:</Text> Danh sách phim đã xem, thời gian xem, phim yêu thích để đề xuất nội dung chính xác.{'\n'}
                • <Text style={styles.boldText}>Thông tin thiết bị:</Text> Loại thiết bị, hệ điều hành, địa chỉ IP để tối ưu hóa chất lượng truyền phát 4K.
              </Text>
            </View>

            {/* Privacy Section 2 */}
            <View style={styles.legalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="lock-closed-outline" size={18} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>2. Tiêu Chuẩn Bảo Mật Dữ Liệu</Text>
              </View>
              <Text style={styles.legalParagraph}>
                Chúng tôi áp dụng các tiêu chuẩn an ninh mạng hàng đầu:
                {'\n'}• Mã hóa toàn bộ đường truyền dữ liệu bằng giao thức <Text style={styles.boldText}>SSL/TLS 256-bit</Text>.
                {'\n'}• Mật khẩu được mã hóa một chiều (Hashing) an toàn tuyệt đối.
                {'\n'}• Thông tin thanh toán (thẻ ngân hàng, ví điện tử) được xử lý trực tiếp qua các cổng thanh toán đạt chứng chỉ PCI-DSS cấp độ 1, CINESTREAM hoàn toàn không lưu trữ số thẻ của bạn.
              </Text>
            </View>

            {/* Privacy Section 3 */}
            <View style={styles.legalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="eye-off-outline" size={18} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>3. Cam Kết Không Bán Dữ Liệu</Text>
              </View>
              <Text style={styles.legalParagraph}>
                CINESTREAM cam kết <Text style={styles.boldText}>KHÔNG</Text> bán, cho thuê hay thương mại hóa thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo rác.
              </Text>
            </View>

            {/* Privacy Section 4 */}
            <View style={styles.legalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="trash-bin-outline" size={18} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>4. Quyền Xóa Dữ Liệu Của Bạn</Text>
              </View>
              <Text style={styles.legalParagraph}>
                {'Bạn có toàn quyền yêu cầu xuất bản sao dữ liệu hoặc yêu cầu xóa vĩnh viễn tài khoản và toàn bộ lịch sử xem khỏi hệ thống bất cứ lúc nào trong mục "Tài khoản & Bảo mật" → "Xóa tài khoản".'}
              </Text>
            </View>
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
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  lastUpdatedText: {
    fontSize: 11.5,
    color: CinemaColors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  contentSection: {
    gap: 14,
  },
  legalCard: {
    backgroundColor: CinemaColors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  legalParagraph: {
    fontSize: 13,
    color: CinemaColors.textSecondary,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
});
