import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';
import { getSocket } from '@/services/socket';
import { UserAPI } from '@/services/API';

export interface CommentItem {
  id: string;
  numericId?: number;
  user: string;
  avatar: string;
  rating?: number;
  time: string;
  content: string;
  likes: number;
  isLiked?: boolean;
}

const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: 'cmt-1',
    user: 'Trần Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    time: '2 giờ trước',
    content: 'Kỹ xảo vượt xa kỳ vọng! Phân cảnh du hành qua hố đen Nebula đỉnh cao thực sự, âm thanh Dolby Atmos làm rung chuyển cả phòng.',
    likes: 42,
    isLiked: false,
  },
  {
    id: 'cmt-2',
    user: 'Lê Minh Anh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    time: '5 giờ trước',
    content: 'Cốt truyện lôi cuốn từ đầu đến cuối, diễn xuất của David Vance quá cảm xúc. Siêu phẩm viễn tưởng hay nhất năm!',
    likes: 28,
    isLiked: false,
  },
  {
    id: 'cmt-3',
    user: 'Nguyễn Quốc Huy',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    rating: 4,
    time: '1 ngày trước',
    content: 'Đoạn đầu hơi chậm một chút để giải thích lý thuyết vật lý lượng tử nhưng nửa sau gay cấn nghẹt thở.',
    likes: 15,
    isLiked: false,
  },
  {
    id: 'cmt-4',
    user: 'Phạm Thu Trang',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    time: '1 ngày trước',
    content: 'Nhạc phim đỉnh của chóp! Xem rạp hay xem qua app tai nghe đều phê chữ ê kéo dài.',
    likes: 19,
    isLiked: false,
  },
];

interface CommentsSectionProps {
  targetId?: string;
  targetType?: 'movie' | 'episode';
  title?: string;
  showRatingPicker?: boolean;
  initialComments?: CommentItem[];
  initialVisibleCount?: number;
  loadIncrement?: number;
  onCommentAdded?: (comment: CommentItem) => void;
  style?: ViewStyle;
}

export function CommentsSection({
  targetId,
  targetType = 'movie',
  title = 'Bình luận & Đánh giá',
  showRatingPicker = true,
  initialComments,
  initialVisibleCount = 3,
  loadIncrement = 5,
  onCommentAdded,
  style,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(
    initialComments && initialComments.length > 0 ? initialComments : DEFAULT_COMMENTS
  );
  const [newCommentText, setNewCommentText] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  // Tải bình luận thực từ backend và lắng nghe Socket.io realtime
  useEffect(() => {
    if (!targetId) return;

    // 1. Tải bình luận qua REST API
    UserAPI.getComments(targetId)
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setComments(res.data);
        }
      })
      .catch(() => {});

    // 2. Kết nối Socket.io theo phòng bộ phim
    const socket = getSocket();
    socket.emit('join_movie', targetId);

    const handleNewComment = (newCmt: any) => {
      setComments((prev) => {
        if (prev.some((c) => String(c.id) === String(newCmt.id))) return prev;
        const optIdx = prev.findIndex(
          (c) =>
            (newCmt.clientCommentId && (c as any).clientCommentId === newCmt.clientCommentId) ||
            c.id === newCmt.clientCommentId
        );
        if (optIdx !== -1) {
          const updated = [...prev];
          updated[optIdx] = {
            ...updated[optIdx],
            ...newCmt,
            id: String(newCmt.id),
          };
          return updated;
        }
        return [newCmt, ...prev];
      });
      setVisibleCount((prev) => prev + 1);
    };

    const handleCommentLiked = (data: { commentId: string; likes: number }) => {
      setComments((prev) =>
        prev.map((c) => (String(c.id) === String(data.commentId) ? { ...c, likes: data.likes } : c))
      );
    };

    socket.on('new_comment', handleNewComment);
    socket.on('comment_liked', handleCommentLiked);

    return () => {
      socket.emit('leave_movie', targetId);
      socket.off('new_comment', handleNewComment);
      socket.off('comment_liked', handleCommentLiked);
    };
  }, [targetId]);

  const handleAddComment = () => {
    if (!newCommentText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bình luận của bạn.');
      return;
    }

    const content = newCommentText.trim();
    const ratingVal = showRatingPicker ? userRating : undefined;
    const clientCommentId = `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Gửi qua Socket.io realtime duy nhất khi kết nối, fallback REST API khi ngắt kết nối
    if (targetId) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('send_comment', {
          movieIdOrSlug: targetId,
          content,
          rating: ratingVal,
          clientCommentId,
        });
      } else {
        UserAPI.postComment(targetId, content, ratingVal).catch(() => {});
      }
    }

    const localComment: CommentItem = {
      id: clientCommentId,
      user: 'Bạn (Người dùng)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      rating: ratingVal,
      time: 'Vừa xong',
      content,
      likes: 0,
      isLiked: false,
    };
    (localComment as any).clientCommentId = clientCommentId;

    setComments((prev) => [localComment, ...prev]);
    setNewCommentText('');
    setVisibleCount((prev) => prev + 1);
    onCommentAdded?.(localComment);
    Alert.alert('Thành công', 'Đã đăng bình luận & đánh giá của bạn!');
  };

  const handleToggleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLikedNow = !c.isLiked;
          return {
            ...c,
            isLiked: isLikedNow,
            likes: isLikedNow ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        }
        return c;
      })
    );

    if (targetId) {
      const socket = getSocket();
      socket.emit('like_comment', {
        commentId,
        movieIdOrSlug: targetId,
      });
      UserAPI.toggleLikeComment(commentId).catch(() => {});
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + loadIncrement, comments.length));
  };

  const handleCollapse = () => {
    setVisibleCount(initialVisibleCount);
  };

  const displayedComments = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  return (
    <View style={[styles.container, style]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{comments.length}</Text>
          </View>
        </View>
      </View>

      {/* Input Box */}
      <View style={styles.inputCard}>
        <View style={styles.inputTopRow}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            }}
            style={styles.inputAvatar}
          />

          {showRatingPicker && (
            <View style={styles.starPickerContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setUserRating(star)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                >
                  <Ionicons
                    name={star <= userRating ? 'star' : 'star-outline'}
                    size={17}
                    color={star <= userRating ? '#FFD700' : CinemaColors.textMuted}
                  />
                </TouchableOpacity>
              ))}
              <Text style={styles.starRatingLabel}>{userRating}.0/5</Text>
            </View>
          )}
        </View>

        <View style={styles.inputBottomRow}>
          <TextInput
            style={styles.textInput}
            placeholder={
              targetType === 'episode'
                ? 'Thảo luận về tập phim này...'
                : 'Chia sẻ cảm nghĩ của bạn về bộ phim...'
            }
            placeholderTextColor={CinemaColors.textMuted}
            value={newCommentText}
            onChangeText={setNewCommentText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              newCommentText.trim().length > 0 && styles.sendButtonActive,
            ]}
            onPress={handleAddComment}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments List or Empty State */}
      {comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="chatbubbles-outline" size={28} color={CinemaColors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có bình luận nào</Text>
          <Text style={styles.emptySubtitle}>
            Hãy là người đầu tiên chia sẻ cảm nghĩ về{' '}
            {targetType === 'episode' ? 'tập phim này' : 'bộ phim này'}!
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.commentsList}>
            {displayedComments.map((item) => (
              <View key={item.id} style={styles.commentCard}>
                <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />

                <View style={styles.commentContentWrapper}>
                  <View style={styles.commentHeader}>
                    <View>
                      <Text style={styles.userName}>{item.user}</Text>
                      <View style={styles.metaRow}>
                        {item.rating !== undefined && (
                          <View style={styles.ratingBadgeWrapper}>
                            <View style={styles.starsRow}>
                              {[...Array(item.rating)].map((_, i) => (
                                <Ionicons key={i} name="star" size={10} color="#FFD700" />
                              ))}
                            </View>
                            <Text style={styles.ratingBadgeText}>{item.rating}.0</Text>
                          </View>
                        )}
                        {item.rating !== undefined && (
                          <Text style={styles.metaDotText}>•</Text>
                        )}
                        <View style={styles.timeWrapper}>
                          <Ionicons name="time-outline" size={11} color={CinemaColors.textMuted} />
                          <Text style={styles.timeText}>{item.time}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Like Button */}
                    <TouchableOpacity
                      style={[styles.likeButton, item.isLiked && styles.likeButtonActive]}
                      onPress={() => handleToggleLike(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={item.isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                        size={14}
                        color={item.isLiked ? CinemaColors.primary : CinemaColors.textMuted}
                      />
                      <Text style={[styles.likeText, item.isLiked && styles.likeTextActive]}>
                        {item.likes}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.commentBodyText}>{item.content}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ----------------- LOAD MORE / PAGINATION FOOTER ----------------- */}
          <View style={styles.loadMoreContainer}>
            {/* Cấu trúc 1: Hiển thị số bình luận hiện tại / tổng số bình luận */}
            <Text style={styles.loadMoreCountText}>
              Hiển thị{' '}
              <Text style={styles.loadMoreCountHighlight}>{displayedComments.length}</Text>
              {' '}/ {comments.length} bình luận
            </Text>

            {/* Cấu trúc 2: Nút tải thêm bình luận */}
            {hasMore ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-down-circle-outline" size={18} color={CinemaColors.primary} />
                <Text style={styles.loadMoreButtonText}>Tải thêm bình luận</Text>
              </TouchableOpacity>
            ) : (
              comments.length > initialVisibleCount && (
                <TouchableOpacity
                  style={styles.collapseButton}
                  onPress={handleCollapse}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-up-circle-outline" size={18} color={CinemaColors.textSecondary} />
                  <Text style={styles.collapseButtonText}>Thu gọn bình luận</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 26,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: CinemaColors.surfaceElevated,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: CinemaColors.textSecondary,
  },

  /* Input Card */
  inputCard: {
    backgroundColor: CinemaColors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    marginBottom: 16,
  },
  inputTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CinemaColors.primaryBorder,
  },
  starPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starRatingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 6,
  },
  inputBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    backgroundColor: CinemaColors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: CinemaColors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CinemaColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  sendButtonActive: {
    backgroundColor: CinemaColors.primary,
    borderColor: CinemaColors.primary,
  },

  /* Comments List */
  commentsList: {
    gap: 12,
  },
  commentCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: CinemaColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  commentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CinemaColors.surfaceElevated,
  },
  commentContentWrapper: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  ratingBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1.5,
  },
  ratingBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFD700',
  },
  metaDotText: {
    fontSize: 10,
    color: CinemaColors.textMuted,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    fontSize: 11,
    color: CinemaColors.textMuted,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: CinemaColors.surfaceElevated,
  },
  likeButtonActive: {
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
  },
  likeText: {
    fontSize: 11,
    fontWeight: '600',
    color: CinemaColors.textMuted,
  },
  likeTextActive: {
    color: CinemaColors.primary,
  },
  commentBodyText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: CinemaColors.textTertiary,
  },

  /* Load More Footer */
  loadMoreContainer: {
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  loadMoreCountText: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    fontWeight: '500',
  },
  loadMoreCountHighlight: {
    color: CinemaColors.primary,
    fontWeight: '700',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: CinemaColors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CinemaColors.primaryBorder,
  },
  loadMoreButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.primary,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: CinemaColors.surface,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  collapseButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    paddingHorizontal: 20,
    backgroundColor: CinemaColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CinemaColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: CinemaColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
