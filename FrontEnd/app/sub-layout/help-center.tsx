import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';
import { getSocket } from '@/services/socket';
import { SupportAPI } from '@/services/API';

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

  // Live Chat States (Realtime Socket.io với Admin)
  const [isLiveChatVisible, setIsLiveChatVisible] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollViewRef = useRef<ScrollView>(null);

  // Kết nối và tải hội thoại khi mở modal Live Chat
  useEffect(() => {
    if (!isLiveChatVisible) return;

    let isMounted = true;
    setIsChatLoading(true);
    const socketInstance = getSocket();

    // Lắng nghe tin nhắn mới từ Admin realtime với cơ chế chống trùng lặp (Deduplication)
    const handleIncomingMessage = (msg: any) => {
      if (!isMounted) return;
      setChatMessages((prev) => {
        // Đã có tin nhắn theo id thực từ MySQL
        if (prev.some((m) => String(m.id) === String(msg.id))) return prev;

        // Khớp với tin nhắn optimistic vừa gửi dựa vào clientMsgId
        const optIdx = prev.findIndex(
          (m) =>
            (msg.clientMsgId && (m as any).clientMsgId === msg.clientMsgId) ||
            m.id === msg.clientMsgId
        );

        if (optIdx !== -1) {
          const updated = [...prev];
          updated[optIdx] = {
            ...updated[optIdx],
            id: String(msg.id),
            clientMsgId: msg.clientMsgId,
            text: msg.text,
            time: msg.time || updated[optIdx].time,
          };
          return updated;
        }

        // Tin nhắn mới từ Admin / hệ thống
        return [
          ...prev,
          {
            id: String(msg.id),
            clientMsgId: msg.clientMsgId,
            sender: msg.sender,
            name: msg.name,
            text: msg.text,
            time: msg.time || 'Vừa xong',
          },
        ];
      });

      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    socketInstance.on('new_support_message', handleIncomingMessage);

    SupportAPI.getMySession()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setCurrentTicket(res.data.ticket);
          setCurrentUser(res.data.user);
          setChatMessages(res.data.replies || []);

          // Kết nối Socket.io vào phòng của người dùng
          socketInstance.emit('join_support_user', {
            userId: res.data.user.id,
            ticketId: res.data.ticket.id,
          });
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải phiên hỗ trợ:', err);
      })
      .finally(() => {
        if (isMounted) setIsChatLoading(false);
      });

    return () => {
      isMounted = false;
      socketInstance.off('new_support_message', handleIncomingMessage);
    };
  }, [isLiveChatVisible]);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

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
    const email = 'support@cinestream.vn';
    const subject = encodeURIComponent('Yêu cầu hỗ trợ CINESTREAM');
    const mailtoUrl = `mailto:${email}?subject=${subject}`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    } else {
      Linking.openURL(mailtoUrl).catch(() => {
        Alert.alert('Gửi Email Hỗ Trợ', `Vui lòng gửi email trực tiếp đến: ${email}`);
      });
    }
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !currentTicket || isSendingMsg) return;

    const content = chatInput.trim();
    setIsSendingMsg(true);
    setChatInput('');

    const socket = getSocket();
    const userId = currentUser?.id || 2;
    const userName = currentUser?.full_name || 'Khách hàng';
    const clientMsgId = `user-msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Hiển thị ngay trên giao diện khách hàng (Optimistic UI)
    const localMsg = {
      id: clientMsgId,
      clientMsgId,
      sender: 'user' as const,
      name: userName,
      text: content,
      time: 'Vừa xong',
    };

    setChatMessages((prev) => [...prev, localMsg]);
    setTimeout(() => {
      chatScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // 2. Gửi tin nhắn DUY NHẤT một kênh:
    // Ưu tiên gửi qua Socket.io realtime (Backend sẽ lưu MySQL và broadcast tới Admin)
    if (socket && socket.connected) {
      socket.emit('send_support_message', {
        ticketId: currentTicket.id,
        userId,
        text: content,
        sender: 'user',
        senderName: userName,
        clientMsgId,
      });
      setIsSendingMsg(false);
    } else {
      // Fallback qua REST API chỉ khi Socket mất kết nối
      SupportAPI.sendReply(currentTicket.id, content, userName)
        .catch((err) => {
          console.warn('Lỗi gửi tin nhắn hỗ trợ:', err);
        })
        .finally(() => {
          setIsSendingMsg(false);
        });
    }
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

        {/* Direct Email Support Banner */}
        <View style={styles.emailDirectCard}>
          <View style={styles.emailDirectHeader}>
            <View style={styles.emailDirectIconCircle}>
              <Ionicons name="mail" size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emailDirectTitle}>Bạn cần hỗ trợ chuyên sâu?</Text>
              <Text style={styles.emailDirectSubtitle}>
                Gửi thư trực tiếp tới hòm thư kỹ thuật & hỗ trợ khách hàng của CINESTREAM.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.emailDirectBtn}
            activeOpacity={0.85}
            onPress={handleSendEmail}
          >
            <Ionicons name="paper-plane" size={17} color="#FFFFFF" />
            <Text style={styles.emailDirectBtnText}>Gửi Thư Tới support@cinestream.vn</Text>
          </TouchableOpacity>
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
                  <Text style={styles.agentSub}>
                    {currentTicket?.ticketCode ? `${currentTicket.ticketCode} • ` : ''}Đang trực tuyến
                  </Text>
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
              ref={chatScrollViewRef}
              style={styles.chatMessagesContainer}
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              {isChatLoading && (
                <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={CinemaColors.primary} />
                </View>
              )}
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
                  (!chatInput.trim() || isSendingMsg) && styles.sendChatBtnDisabled,
                ]}
                activeOpacity={0.8}
                disabled={!chatInput.trim() || isSendingMsg}
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

  /* Direct Email Support Banner */
  emailDirectCard: {
    backgroundColor: CinemaColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    marginTop: 8,
  },
  emailDirectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  emailDirectIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailDirectTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 3,
  },
  emailDirectSubtitle: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    lineHeight: 16,
  },
  emailDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emailDirectBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
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
