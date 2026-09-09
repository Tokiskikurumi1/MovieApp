import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Modal,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'VIP & Tài khoản',
    question: 'Làm thế nào để nâng cấp gói VIP 4K?',
    answer:
      'Bạn có thể vào mục "Tài khoản" -> "Gói Cước & Thanh Toán" để lựa chọn các gói 1 tháng, 6 tháng hoặc 1 năm. Sau khi hoàn tất thanh toán qua MoMo, ZaloPay hoặc thẻ ngân hàng, tài khoản sẽ được nâng cấp VIP ngay lập tức.',
  },
  {
    id: 'faq-2',
    category: 'VIP & Tài khoản',
    question: 'Tôi có thể chia sẻ tài khoản VIP cho bao nhiêu thiết bị?',
    answer:
      'Gói VIP 4K Siêu Cấp cho phép đăng nhập và phát đồng thời trên tối đa 4 thiết bị (Điện thoại, Máy tính bảng, Smart TV, Web). Bạn có thể quản lý danh sách thiết bị trong phần "Tài khoản & Bảo mật".',
  },
  {
    id: 'faq-3',
    category: 'Video & Phát lại',
    question: 'Tại sao video không tự phát chất lượng 4K Ultra HD?',
    answer:
      'Chất lượng video tự động điều chỉnh theo tốc độ đường truyền Internet của bạn. Để ép phát 4K, hãy nhấn vào biểu tượng độ phân giải ở góc dưới trình phát và chọn "4K Ultra HD (VIP)". Đảm bảo đường truyền đạt tối thiểu 25 Mbps.',
  },
  {
    id: 'faq-4',
    category: 'Video & Phát lại',
    question: 'Làm sao để tải phim xem khi không có mạng (Offline)?',
    answer:
      'Tại trang xem phim, nhấn vào nút "Tải xuống" bên dưới video. Bạn có thể kiểm tra danh sách phim đã tải trong mục Thư viện để xem mượt mà bất cứ lúc nào.',
  },
  {
    id: 'faq-5',
    category: 'Thanh toán',
    question: 'Chính sách hoàn tiền khi gặp sự cố thế nào?',
    answer:
      'CINESTREAM cam kết hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn không hài lòng về dịch vụ hoặc gặp lỗi kỹ thuật không thể khắc phục.',
  },
  {
    id: 'faq-6',
    category: 'Thiết bị & Smart TV',
    question: 'Làm thế nào để truyền phim lên Smart TV (Chromecast / AirPlay)?',
    answer:
      'Hãy đảm bảo điện thoại và Smart TV kết nối cùng một mạng Wi-Fi. Nhấn vào biểu tượng màn hình TV ở góc trên bên phải trình phát video để tìm và kết nối thiết bị.',
  },
];

const CATEGORIES = ['Tất cả', 'VIP & Tài khoản', 'Video & Phát lại', 'Thanh toán', 'Thiết bị & Smart TV'];

export default function HelpCenterScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  // Ticket Form States
  const [ticketTopic, setTicketTopic] = useState('Lỗi phát video');
  const [ticketContent, setTicketContent] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Live Chat Modal States
  const [isLiveChatVisible, setIsLiveChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm-1',
      sender: 'agent',
      text: 'Xin chào! Tôi là trợ lý AI của CINESTREAM 24/7. Tôi có thể hỗ trợ gì cho bạn hôm nay?',
      time: 'Vừa xong',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = FAQS.filter((item) => {
    const matchCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCallHotline = () => {
    Alert.alert('Gọi tổng đài hỗ trợ 24/7', 'Hotline miễn phí: 1900 6868', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Gọi ngay', onPress: () => Linking.openURL('tel:19006868').catch(() => {}) },
    ]);
  };

  const handleSendEmail = () => {
    Linking.openURL('mailto:support@cinestream.vn?subject=Yêu cầu hỗ trợ CINESTREAM').catch(() => {
      Alert.alert('Thông báo', 'Địa chỉ email hỗ trợ: support@cinestream.vn');
    });
  };

  const handleSubmitTicket = () => {
    if (!ticketContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả chi tiết vấn đề bạn đang gặp phải.');
      return;
    }

    setIsSubmittingTicket(true);
    setTimeout(() => {
      setIsSubmittingTicket(false);
      setTicketContent('');
      Alert.alert(
        'Đã gửi yêu cầu thành công! 🎫',
        'Mã yêu cầu hỗ trợ: #CS-99482. Đội ngũ kỹ thuật viên 24/7 sẽ phản hồi qua email của bạn trong vòng 15-30 phút.'
      );
    }, 800);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: chatInput.trim(),
      time: 'Vừa xong',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulated Agent reply
    setTimeout(() => {
      const replies = [
        'Cảm ơn bạn đã liên hệ! Kỹ thuật viên CINESTREAM đã ghi nhận thông tin và đang kiểm tra trên hệ thống.',
        'Vấn đề của bạn đã được tiếp nhận, chúng tôi sẽ xử lý ngay lập tức!',
        'Bạn vui lòng thử tải lại trang hoặc kiểm tra kết nối mạng trong giây lát nhé.',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: randomReply,
          time: 'Vừa xong',
        },
      ]);
    }, 1000);
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
        <Text style={styles.headerTitle}>Trung Tâm Trợ Giúp 24/7</Text>
        <TouchableOpacity
          style={styles.headerChatBtn}
          activeOpacity={0.8}
          onPress={() => setIsLiveChatVisible(true)}
        >
          <Ionicons name="chatbubbles" size={20} color={CinemaColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Box */}
        <View style={styles.searchBoxContainer}>
          <Ionicons name="search-outline" size={18} color={CinemaColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm câu hỏi, vấn đề cần trợ giúp..."
            placeholderTextColor={CinemaColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* 24/7 Quick Contact Channels */}
        <Text style={styles.sectionHeading}>KÊNH HỖ TRỢ TRỰC TUYẾN 24/7</Text>
        <View style={styles.channelsGrid}>
          {/* 1. Live Chat 24/7 */}
          <TouchableOpacity
            style={styles.channelCard}
            activeOpacity={0.8}
            onPress={() => setIsLiveChatVisible(true)}
          >
            <View style={[styles.channelIconBox, { backgroundColor: 'rgba(255, 51, 75, 0.15)' }]}>
              <Ionicons name="chatbubbles" size={22} color={CinemaColors.primary} />
            </View>
            <Text style={styles.channelTitle}>Chat Trực Tuyến</Text>
            <Text style={styles.channelSubtitle}>Phản hồi tức thì & AI</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineText}>Đang hoạt động</Text>
            </View>
          </TouchableOpacity>

          {/* 2. Hotline */}
          <TouchableOpacity
            style={styles.channelCard}
            activeOpacity={0.8}
            onPress={handleCallHotline}
          >
            <View style={[styles.channelIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="call" size={22} color="#10B981" />
            </View>
            <Text style={styles.channelTitle}>Tổng Đài 1900 6868</Text>
            <Text style={styles.channelSubtitle}>Miễn phí cước gọi</Text>
            <Text style={styles.channelAction}>Gọi ngay</Text>
          </TouchableOpacity>

          {/* 3. Email */}
          <TouchableOpacity
            style={styles.channelCard}
            activeOpacity={0.8}
            onPress={handleSendEmail}
          >
            <View style={[styles.channelIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="mail" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.channelTitle}>Gửi Email</Text>
            <Text style={styles.channelSubtitle}>support@cinestream.vn</Text>
            <Text style={styles.channelAction}>Gửi thư</Text>
          </TouchableOpacity>

          {/* 4. Zalo / VIP Support */}
          <TouchableOpacity
            style={styles.channelCard}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Zalo OA', 'Chuyển sang kênh Zalo Official Account CINESTREAM')}
          >
            <View style={[styles.channelIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="shield-checkmark" size={22} color="#F59E0B" />
            </View>
            <Text style={styles.channelTitle}>Ưu Tiên VIP</Text>
            <Text style={styles.channelSubtitle}>Hỗ trợ 1-1 chuyên sâu</Text>
            <Text style={styles.channelAction}>Kết nối</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs Category Filter Pills */}
        <Text style={styles.sectionHeading}>CÂU HỎI THƯỜNG GẶP (FAQ)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              activeOpacity={0.75}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat && styles.categoryPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQs Accordion List */}
        <View style={styles.faqsList}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <View key={faq.id} style={styles.faqCard}>
                  <TouchableOpacity
                    style={styles.faqQuestionRow}
                    activeOpacity={0.7}
                    onPress={() => toggleFaq(faq.id)}
                  >
                    <View style={styles.faqQuestionLeft}>
                      <Ionicons
                        name="help-circle-outline"
                        size={18}
                        color={isExpanded ? CinemaColors.primary : CinemaColors.textMuted}
                      />
                      <Text
                        style={[
                          styles.faqQuestionText,
                          isExpanded && { color: CinemaColors.primary },
                        ]}
                      >
                        {faq.question}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={CinemaColors.textMuted}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyFaq}>
              <Ionicons name="search" size={32} color={CinemaColors.textMuted} />
              <Text style={styles.emptyFaqText}>Không tìm thấy câu hỏi phù hợp</Text>
            </View>
          )}
        </View>

        {/* Submit a Support Ticket Form */}
        <View style={styles.ticketSection}>
          <Text style={styles.sectionHeading}>GỬI PHẢN HỒI / BÁO LỖI (TICKET)</Text>
          <View style={styles.ticketCard}>
            <Text style={styles.ticketInputLabel}>CHỦ ĐỀ CẦN HỖ TRỢ</Text>
            <View style={styles.topicOptionsRow}>
              {['Lỗi phát video', 'Tài khoản VIP', 'Thanh toán', 'Góp ý'].map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.topicChip,
                    ticketTopic === topic && styles.topicChipActive,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setTicketTopic(topic)}
                >
                  <Text
                    style={[
                      styles.topicChipText,
                      ticketTopic === topic && styles.topicChipTextActive,
                    ]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ticketInputLabel}>MÔ TẢ CHI TIẾT</Text>
            <TextInput
              style={styles.ticketTextArea}
              placeholder="Vui lòng mô tả chi tiết sự cố bạn gặp phải kèm tên phim / thiết bị..."
              placeholderTextColor={CinemaColors.textMuted}
              multiline
              numberOfLines={4}
              value={ticketContent}
              onChangeText={setTicketContent}
            />

            <TouchableOpacity
              style={styles.submitTicketBtn}
              activeOpacity={0.85}
              onPress={handleSubmitTicket}
              disabled={isSubmittingTicket}
            >
              <Text style={styles.submitTicketText}>
                {isSubmittingTicket ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Hỗ Trợ'}
              </Text>
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ============================================================= */}
      {/* MODAL: LIVE CHAT 24/7 (INTERACTIVE CHAT SIMULATION)          */}
      {/* ============================================================= */}
      <Modal
        visible={isLiveChatVisible}
        animationType="slide"
        onRequestClose={() => setIsLiveChatVisible(false)}
      >
        <SafeAreaView style={styles.chatModalSafeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <View style={styles.agentAvatarBox}>
                  <Ionicons name="headset" size={20} color="#FFFFFF" />
                  <View style={styles.agentOnlineBadge} />
                </View>
                <View>
                  <Text style={styles.agentName}>CINESTREAM Support 24/7</Text>
                  <Text style={styles.agentSub}>Đang trực tuyến • Hỗ trợ tức thì</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsLiveChatVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color={CinemaColors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <ScrollView
              style={styles.chatMessagesContainer}
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              {chatMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userBubble : styles.agentBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.userMessageText : styles.agentMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text style={styles.messageTime}>{msg.time}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Chat Input Bar */}
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Nhập tin nhắn hỗ trợ..."
                placeholderTextColor={CinemaColors.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendChatMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[
                  styles.sendChatBtn,
                  !chatInput.trim() && styles.sendChatBtnDisabled,
                ]}
                activeOpacity={0.8}
                disabled={!chatInput.trim()}
                onPress={handleSendChatMessage}
              >
                <Ionicons name="paper-plane" size={17} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
  headerChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 75, 0.3)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* Search Box */
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CinemaColors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: CinemaColors.textPrimary,
    fontSize: 13.5,
  },

  /* Section Heading */
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: CinemaColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  /* Quick Channels Grid */
  channelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  channelCard: {
    width: '48%',
    backgroundColor: CinemaColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  channelIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  channelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 2,
  },
  channelSubtitle: {
    fontSize: 11,
    color: CinemaColors.textMuted,
    marginBottom: 8,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 10.5,
    color: '#10B981',
    fontWeight: '700',
  },
  channelAction: {
    fontSize: 11.5,
    color: CinemaColors.primary,
    fontWeight: '700',
  },

  /* Category Pills */
  categoryPillsList: {
    gap: 8,
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: CinemaColors.surface,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  categoryPillActive: {
    backgroundColor: CinemaColors.primary,
    borderColor: CinemaColors.primary,
  },
  categoryPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* FAQs List */
  faqsList: {
    gap: 10,
    marginBottom: 24,
  },
  faqCard: {
    backgroundColor: CinemaColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  faqQuestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  faqQuestionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    flex: 1,
  },
  faqAnswerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  faqAnswerText: {
    fontSize: 12.5,
    color: CinemaColors.textSecondary,
    lineHeight: 18,
  },
  emptyFaq: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  emptyFaqText: {
    fontSize: 13,
    color: CinemaColors.textMuted,
  },

  /* Ticket Section */
  ticketSection: {
    marginTop: 6,
  },
  ticketCard: {
    backgroundColor: CinemaColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  ticketInputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: CinemaColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  topicOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: CinemaColors.surfaceElevated,
  },
  topicChipActive: {
    backgroundColor: CinemaColors.primary,
  },
  topicChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  topicChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ticketTextArea: {
    backgroundColor: CinemaColors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    color: CinemaColors.textPrimary,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CinemaColors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  submitTicketText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Live Chat Modal */
  chatModalSafeArea: {
    flex: 1,
    backgroundColor: CinemaColors.background,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: CinemaColors.surface,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  agentAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CinemaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  agentOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: CinemaColors.surface,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  agentSub: {
    fontSize: 11,
    color: '#10B981',
  },
  chatMessagesContainer: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 14,
  },
  agentBubble: {
    backgroundColor: CinemaColors.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: CinemaColors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 18,
    marginBottom: 4,
  },
  agentMessageText: {
    color: CinemaColors.textPrimary,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    alignSelf: 'flex-end',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: CinemaColors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: CinemaColors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: CinemaColors.textPrimary,
    fontSize: 13.5,
  },
  sendChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CinemaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendChatBtnDisabled: {
    opacity: 0.5,
  },
});
