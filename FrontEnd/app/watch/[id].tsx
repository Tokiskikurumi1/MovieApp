import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Share,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { CinemaColors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

// -------------------------------------------------------------
// DỮ LIỆU MẪU CÁC TẬP PHIM (EPISODES DATA)
// -------------------------------------------------------------
interface Episode {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  isVip: boolean;
}

const SEASON_2_EPISODES: Episode[] = [
  {
    id: 1,
    title: 'Tập 1: Làng Của Những Cư Dân Mới',
    duration: '23:45',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    isVip: false,
  },
  {
    id: 2,
    title: 'Tập 2: Thần Nông Nghiệp Và Những Vị Khách',
    duration: '24:10',
    thumbnail: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=600&auto=format&fit=crop',
    isVip: false,
  },
  {
    id: 3,
    title: 'Tập 3: Cuộc Viếng Thăm Của Tộc Dwarf',
    duration: '23:50',
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
  {
    id: 4,
    title: 'Tập 4: Lễ Hội Rượu Của Trưởng Lão Donoban',
    duration: '24:00',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
  {
    id: 5,
    title: 'Tập 5: Mùa Thu Hoạch Bội Thu',
    duration: '23:30',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
  {
    id: 6,
    title: 'Tập 6: Những Vị Khách Đến Từ Biển',
    duration: '24:15',
    thumbnail: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
  {
    id: 7,
    title: 'Tập 7: Khám Phá Rừng Sâu',
    duration: '23:45',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
  {
    id: 8,
    title: 'Tập 8: Thử Thách Của Ma Vương',
    duration: '24:00',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
  {
    id: 9,
    title: 'Tập 9: Xây Dựng Suối Nước Nóng Mới',
    duration: '23:55',
    thumbnail: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
  {
    id: 10,
    title: 'Tập 10: Trận Đấu Giao Hữu Mùa Đông',
    duration: '24:20',
    thumbnail: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
  {
    id: 11,
    title: 'Tập 11: Lời Hứa Của Tộc Rồng',
    duration: '24:05',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
  {
    id: 12,
    title: 'Tập 12: Đại Tiệc Chào Đón Năm Mới',
    duration: '25:10',
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop',
    isVip: true,
  },
];

// -------------------------------------------------------------
// DỮ LIỆU ĐỀ XUẤT (RECOMMENDED ANIME/MOVIES)
// -------------------------------------------------------------
const RECOMMENDATIONS = [
  {
    id: 'rec-1',
    title: 'Tôi Có Thực Sự Là Người Mạnh Nhất Không?',
    episodesBadge: 'Trọn bộ',
    tags: ['Tiểu thuyết chuyển thể', 'Dị giới'],
    views: '17.5M Lượt xem',
    image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-2',
    title: 'Lúc đó tôi đã chuyển sinh thành Slime the Movie: Mối Liên Kết Đỏ...',
    episodesBadge: 'Bản Rạp',
    tags: ['Truyện tranh chuyển thể', 'Nhiệt huyết'],
    views: '28.3M Lượt xem',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-3',
    title: 'Thất Nghiệp Chuyển Sinh - Phần 2: Khởi Đầu Mới',
    episodesBadge: 'Trọn bộ 24 tập',
    tags: ['Phép thuật', 'Hành động', 'Isekai'],
    views: '34.1M Lượt xem',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-4',
    title: 'Kage no Jitsuryokusha ni Naritakute! - Mùa 2',
    episodesBadge: 'Trọn bộ',
    tags: ['Hài hước', 'Hành động', 'Bá đạo'],
    views: '21.6M Lượt xem',
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop',
  },
];

// -------------------------------------------------------------
// DỮ LIỆU BÌNH LUẬN & PHẢN HỒI KIỂU FACEBOOK (FB COMMENT THREAD)
// -------------------------------------------------------------
interface CommentReply {
  id: string;
  user: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  isLiked?: boolean;
}

interface CommentItemData {
  id: string;
  user: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  replies?: CommentReply[];
  isRepliesExpanded?: boolean;
}

const INITIAL_COMMENTS: CommentItemData[] = [
  {
    id: 'c-1',
    user: 'Tiến Tài_8690',
    time: '2 giờ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    content: 'Có ai ko sao ko ai bình luận vậy',
    likes: 9,
    isLiked: false,
    isRepliesExpanded: true,
    replies: [
      {
        id: 'r-1-1',
        user: 'Võ Thiết VN',
        time: '1 giờ',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        content: 'Tôi tới bầu bạn vs bro đây',
        likes: 4,
        isLiked: false,
      },
      {
        id: 'r-1-2',
        user: 'Nguyễn Văn Nam',
        time: '30 phút',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
        content: 'Xem xong mới xuống cmt bro ơi, tập này cuốn quá!',
        likes: 2,
        isLiked: false,
      },
    ],
  },
  {
    id: 'c-2',
    user: 'Anime_Fan_2026',
    time: '3 giờ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    content: 'Đồ họa mùa 2 đẹp thật sự, cảnh mấy ông Dwarf uống rượu nhìn hài xỉu 😂',
    likes: 42,
    isLiked: false,
    isRepliesExpanded: false,
    replies: [
      {
        id: 'r-2-1',
        user: 'Hải Đăng',
        time: '2 giờ',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
        content: 'Chuẩn luôn, biểu cảm ông già Donoban đỉnh vãi haha',
        likes: 7,
        isLiked: false,
      },
    ],
  },
  {
    id: 'c-3',
    user: 'Kurumi_Lover',
    time: '5 giờ',
    avatar: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=200&auto=format&fit=crop',
    content: 'Phim nhẹ nhàng chữa lành cực, xem sau giờ làm việc bao xả stress. 10/10!',
    likes: 18,
    isLiked: false,
    replies: [],
  },
];

export default function WatchMovieScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Tabs: 'overview' | 'comments'
  const [activeTab, setActiveTab] = useState<'overview' | 'comments'>('overview');

  // Video Player & Orientation State
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState('04:35');
  const [totalDuration] = useState('23:45');
  const [progressRatio, setProgressRatio] = useState(0.2); // 20%
  const [selectedQuality, setSelectedQuality] = useState('1080P');
  const [isQualityModalVisible, setIsQualityModalVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Orientation listener & cleanup
  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      const orientation = event.orientationInfo.orientation;
      if (
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      ) {
        setIsFullscreen(true);
      } else if (
        orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
        orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
      ) {
        setIsFullscreen(false);
      }
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        setIsFullscreen(true);
      }
    } catch (error) {
      console.warn('Error toggling screen orientation:', error);
    }
  };

  const handlePlayerBack = async () => {
    if (isFullscreen) {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      } catch (error) {
        console.warn('Error resetting orientation:', error);
      }
    } else {
      router.back();
    }
  };

  // Episodes & Season State
  const [selectedSeason, setSelectedSeason] = useState<'Mùa 1' | 'Mùa 2'>('Mùa 2');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(1);
  const [isAllEpisodesModalVisible, setIsAllEpisodesModalVisible] = useState(false);

  // Interaction States
  const [likeCount, setLikeCount] = useState(20700);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  // Comments State (FB Style)
  const [comments, setComments] = useState<CommentItemData[]>(INITIAL_COMMENTS);
  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<{
    parentId: string;
    username: string;
  } | null>(null);

  const commentInputRef = useRef<TextInput>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích',
      isFavorite ? 'Phim đã được xóa khỏi danh sách yêu thích.' : 'Phim đã được lưu vào danh sách yêu thích của bạn.'
    );
  };

  const handleDownload = () => {
    setIsDownloaded(!isDownloaded);
    Alert.alert(
      isDownloaded ? 'Hủy tải' : 'Đang tải xuống',
      isDownloaded
        ? 'Đã xóa bản tải về của tập này.'
        : `Tập ${selectedEpisodeId} đang được tải xuống với chất lượng ${selectedQuality}.`
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Nông Dân Nhàn Nhã Ở Dị Giới - Mùa 2',
        message: 'Đang xem Nông Dân Nhàn Nhã Ở Dị Giới - Mùa 2 Tập 1 cực hay trên CINESTREAM!',
      });
    } catch {
      // ignore
    }
  };

  const handleSelectEpisode = (ep: Episode) => {
    setSelectedEpisodeId(ep.id);
    setIsPlaying(true);
    setProgressRatio(0);
    setCurrentTime('00:00');
    setIsAllEpisodesModalVisible(false);
    Alert.alert('Chuyển tập', `Đang phát ${ep.title}`);
  };

  // Handle Send Facebook Style Comment / Reply
  const handleSendComment = () => {
    if (!commentInput.trim()) return;

    if (replyingTo) {
      // Adding a reply under parent comment
      const newReply: CommentReply = {
        id: `r-${Date.now()}`,
        user: 'Kurumi Tokisaki',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        time: 'Vừa xong',
        content: commentInput.trim(),
        likes: 0,
        isLiked: false,
      };

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === replyingTo.parentId) {
            return {
              ...c,
              isRepliesExpanded: true,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        })
      );

      setReplyingTo(null);
    } else {
      // Adding a top-level comment
      const newComment: CommentItemData = {
        id: `c-${Date.now()}`,
        user: 'Kurumi Tokisaki',
        time: 'Vừa xong',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        content: commentInput.trim(),
        likes: 0,
        isLiked: false,
        replies: [],
      };

      setComments([newComment, ...comments]);
    }

    setCommentInput('');
    Keyboard.dismiss();
  };

  // Like parent comment
  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            likes: c.isLiked ? c.likes - 1 : c.likes + 1,
            isLiked: !c.isLiked,
          };
        }
        return c;
      })
    );
  };

  // Like nested reply
  const handleLikeReply = (parentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId && c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id === replyId) {
                return {
                  ...r,
                  likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                  isLiked: !r.isLiked,
                };
              }
              return r;
            }),
          };
        }
        return c;
      })
    );
  };

  // Start replying to a user
  const handleStartReply = (parentId: string, username: string) => {
    setReplyingTo({ parentId, username });
    setCommentInput(`@${username} `);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  // Toggle expand/collapse replies
  const handleToggleExpandReplies = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            isRepliesExpanded: !c.isRepliesExpanded,
          };
        }
        return c;
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden={isFullscreen} barStyle="light-content" backgroundColor="#000000" />

      {/* ============================================================= */}
      {/* 1. TOP VIDEO PLAYER CONTAINER (16:9 RATIO / FULLSCREEN)       */}
      {/* ============================================================= */}
      <View
        style={[
          styles.videoPlayerContainer,
          isFullscreen && {
            width: windowWidth,
            height: windowHeight,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          },
        ]}
      >
        {/* Main Video Scene Background Image */}
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
          }}
          style={styles.videoImage}
        />

        {/* Clickable Overlay to Toggle Controls */}
        <TouchableOpacity
          style={styles.videoTouchOverlay}
          activeOpacity={1}
          onPress={toggleControls}
        >
          {showControls && (
            <View style={styles.controlsOverlay}>
              {/* Top Controls Bar */}
              <View style={styles.playerTopBar}>
                <TouchableOpacity
                  style={styles.playerIconButton}
                  onPress={handlePlayerBack}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.playerMovieTitle} numberOfLines={1}>
                  Tập {selectedEpisodeId} • Nông Dân Nhàn Nhã Ở Dị Giới
                </Text>

                <View style={styles.playerTopRight}>
                  <TouchableOpacity
                    style={styles.playerIconButton}
                    activeOpacity={0.7}
                    onPress={() => setIsQualityModalVisible(true)}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Center Play/Pause Controls */}
              <View style={styles.playerCenterControls}>
                <TouchableOpacity
                  style={styles.playerSeekBtn}
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Lùi 10s')}
                >
                  <Ionicons name="play-back" size={26} color="#FFFFFF" />
                  <Text style={styles.seekSecondsText}>10s</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playerPlayPauseBtn}
                  activeOpacity={0.8}
                  onPress={handleTogglePlay}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={36}
                    color="#FFFFFF"
                    style={!isPlaying ? { marginLeft: 3 } : undefined}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playerSeekBtn}
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Tua 10s')}
                >
                  <Ionicons name="play-forward" size={26} color="#FFFFFF" />
                  <Text style={styles.seekSecondsText}>10s</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Timeline Bar */}
              <View style={styles.playerBottomBar}>
                <Text style={styles.playerTimeText}>{currentTime}</Text>

                {/* Progress Bar Track */}
                <View style={styles.playerTimelineTrack}>
                  <View style={[styles.playerTimelineFill, { width: `${progressRatio * 100}%` }]} />
                  <View style={[styles.playerTimelineThumb, { left: `${progressRatio * 100}%` }]} />
                </View>

                <Text style={styles.playerTimeText}>{totalDuration}</Text>

                <TouchableOpacity
                  style={styles.qualityButton}
                  activeOpacity={0.75}
                  onPress={() => setIsQualityModalVisible(true)}
                >
                  <Text style={styles.qualityButtonText}>{selectedQuality}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fullscreenBtn}
                  activeOpacity={0.75}
                  onPress={handleToggleFullscreen}
                >
                  <Ionicons
                    name={isFullscreen ? 'contract-outline' : 'scan-outline'}
                    size={isFullscreen ? 20 : 18}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {!isFullscreen && (
        <>
          {/* ============================================================= */}
          {/* 2. TAB HEADER: GIỚI THIỆU / BÌNH LUẬN 761                     */}
          {/* ============================================================= */}
          <View style={styles.tabHeader}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
              onPress={() => setActiveTab('overview')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.tabButtonTextActive]}>
                Giới thiệu
              </Text>
              {activeTab === 'overview' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'comments' && styles.tabButtonActive]}
              onPress={() => setActiveTab('comments')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabButtonText, activeTab === 'comments' && styles.tabButtonTextActive]}>
                Bình luận <Text style={styles.commentCountText}>761</Text>
              </Text>
              {activeTab === 'comments' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          </View>

          {/* ============================================================= */}
          {/* 3. TAB 1 CONTENT: GIỚI THIỆU & TẬP PHIM & ĐỀ XUẤT             */}
          {/* ============================================================= */}
          {activeTab === 'overview' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Main Title & Views Row */}
              <View style={styles.titleSection}>
                <Text style={styles.mainTitle}>Nông Dân Nhàn Nhã Ở Dị Giới - Mùa 2</Text>

                <TouchableOpacity
                  style={styles.viewsAndMoreRow}
                  activeOpacity={0.7}
                  onPress={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                >
                  <View style={styles.viewsLeft}>
                    <Ionicons name="play-outline" size={14} color={CinemaColors.textSecondary} />
                    <Text style={styles.viewsText}>5.1M</Text>
                  </View>
                  <Ionicons
                    name={isSynopsisExpanded ? 'chevron-up' : 'chevron-forward'}
                    size={16}
                    color={CinemaColors.textSecondary}
                  />
                </TouchableOpacity>

                {/* Expandable Synopsis / Details */}
                {isSynopsisExpanded && (
                  <View style={styles.synopsisCard}>
                    <Text style={styles.synopsisText}>
                      Sau khi qua đời vì bạo bệnh, Machio Hiraku được thần linh hồi sinh tại một dị giới xa xôi với một cơ
                      thể khỏe mạnh và công cụ nông nghiệp toàn năng. Mùa 2 tiếp tục câu chuyện mở rộng ngôi làng, tiếp đón
                      thêm các cư dân tộc Elf, Beastman và tộc Dwarf Trưởng lão Donoban!
                    </Text>
                    <View style={styles.metaTagsRow}>
                      <Text style={styles.metaTagText}>Thể loại: Anime, Hài hước, Giả tưởng, Isekai</Text>
                      <Text style={styles.metaTagText}>Phát hành: 2024 • Studio: Zero-G</Text>
                    </View>
                  </View>
                )}

                {/* Pink Premium Pill Badge */}
                <View style={styles.badgeRow}>
                  <View style={styles.pinkPremiumBadge}>
                    <Ionicons name="diamond" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.pinkPremiumText}>Premium</Text>
                  </View>
                </View>

                {/* 4 Action Buttons in a Row (Like, Favorite, Download, Share) */}
                <View style={styles.actionButtonsRow}>
                  {/* 1. Like */}
                  <TouchableOpacity
                    style={styles.actionCol}
                    activeOpacity={0.7}
                    onPress={handleToggleLike}
                  >
                    <Ionicons
                      name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                      size={22}
                      color={isLiked ? CinemaColors.primary : CinemaColors.textPrimary}
                    />
                    <Text style={[styles.actionLabel, isLiked && { color: CinemaColors.primary }]}>
                      {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}
                    </Text>
                  </TouchableOpacity>

                  {/* 2. Favorite */}
                  <TouchableOpacity
                    style={styles.actionCol}
                    activeOpacity={0.7}
                    onPress={handleToggleFavorite}
                  >
                    <Ionicons
                      name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                      size={22}
                      color={isFavorite ? CinemaColors.primary : CinemaColors.textPrimary}
                    />
                    <Text style={[styles.actionLabel, isFavorite && { color: CinemaColors.primary }]}>
                      Yêu thích
                    </Text>
                  </TouchableOpacity>

                  {/* 3. Download */}
                  <TouchableOpacity
                    style={styles.actionCol}
                    activeOpacity={0.7}
                    onPress={handleDownload}
                  >
                    <Ionicons
                      name={isDownloaded ? 'cloud-done' : 'download-outline'}
                      size={22}
                      color={isDownloaded ? '#10B981' : CinemaColors.textPrimary}
                    />
                    <Text style={[styles.actionLabel, isDownloaded && { color: '#10B981' }]}>
                      {isDownloaded ? 'Đã tải' : 'Tải xuống'}
                    </Text>
                  </TouchableOpacity>

                  {/* 4. Share */}
                  <TouchableOpacity
                    style={styles.actionCol}
                    activeOpacity={0.7}
                    onPress={handleShare}
                  >
                    <Ionicons name="arrow-redo-outline" size={22} color={CinemaColors.textPrimary} />
                    <Text style={styles.actionLabel}>Chia sẻ</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ============================================================= */}
              {/* EPISODES SECTION ("TẬP")                                      */}
              {/* ============================================================= */}
              <View style={styles.episodesSection}>
                <View style={styles.episodesHeaderRow}>
                  <Text style={styles.episodesHeading}>Tập</Text>
                  <TouchableOpacity
                    style={styles.allEpisodesBtn}
                    activeOpacity={0.75}
                    onPress={() => setIsAllEpisodesModalVisible(true)}
                  >
                    <Text style={styles.allEpisodesText}>Trọn bộ</Text>
                    <Ionicons name="chevron-forward" size={14} color={CinemaColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Season Selector Tabs */}
                <View style={styles.seasonsRow}>
                  <TouchableOpacity
                    style={[styles.seasonTab, selectedSeason === 'Mùa 1' && styles.seasonTabActive]}
                    onPress={() => setSelectedSeason('Mùa 1')}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.seasonTabText, selectedSeason === 'Mùa 1' && styles.seasonTabTextActive]}>
                      Mùa 1
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.seasonTab, selectedSeason === 'Mùa 2' && styles.seasonTabActive]}
                    onPress={() => setSelectedSeason('Mùa 2')}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.seasonTabText, selectedSeason === 'Mùa 2' && styles.seasonTabTextActive]}>
                      Mùa 2
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Horizontal Episode Numbered Buttons */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.episodesHorizontalList}
                >
                  {SEASON_2_EPISODES.map((ep) => {
                    const isActive = ep.id === selectedEpisodeId;
                    return (
                      <TouchableOpacity
                        key={ep.id}
                        style={[
                          styles.episodeBox,
                          isActive && styles.episodeBoxActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => handleSelectEpisode(ep)}
                      >
                        <Text style={[styles.episodeBoxNumber, isActive && styles.episodeBoxNumberActive]}>
                          {ep.id}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* ============================================================= */}
              {/* RECOMMENDATIONS SECTION ("ĐỀ XUẤT CHO BẠN")                   */}
              {/* ============================================================= */}
              <View style={styles.recommendationsSection}>
                <Text style={styles.recommendationsHeading}>Đề xuất cho bạn</Text>

                {RECOMMENDATIONS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      Alert.alert('Chuyển phim', `Đang tải ${item.title}`);
                    }}
                  >
                    {/* Left Thumbnail with badges */}
                    <View style={styles.recThumbnailWrapper}>
                      <Image source={{ uri: item.image }} style={styles.recThumbnailImage} />

                      {/* Bottom-Right Episodes Badge */}
                      <View style={styles.recBottomBadge}>
                        <Text style={styles.recBottomBadgeText}>{item.episodesBadge}</Text>
                      </View>
                    </View>

                    {/* Right Info Column */}
                    <View style={styles.recInfoCol}>
                      <Text style={styles.recTitle} numberOfLines={2}>
                        {item.title}
                      </Text>

                      {/* Genre Tags */}
                      <View style={styles.recTagsRow}>
                        {item.tags.map((tag, idx) => (
                          <View key={idx} style={styles.recTagBadge}>
                            <Text style={styles.recTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Views Count */}
                      <View style={styles.recViewsRow}>
                        <Ionicons name="play-outline" size={13} color={CinemaColors.textMuted} />
                        <Text style={styles.recViewsText}>{item.views}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            /* ============================================================= */
            /* 4. TAB 2: BÌNH LUẬN & PHẢN HỒI KIỂU FACEBOOK                 */
            /* ============================================================= */
            <KeyboardAvoidingView
              style={styles.commentsKeyboardContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              {/* Comments List (Facebook Style Nested Threads) */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.commentsListContent}
                keyboardShouldPersistTaps="handled"
              >
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.fbCommentThreadContainer}>
                    {/* 1. TOP-LEVEL PARENT COMMENT */}
                    <View style={styles.fbCommentRow}>
                      {/* Left User Avatar */}
                      <Image source={{ uri: comment.avatar }} style={styles.fbAvatar} />

                      <View style={styles.fbCommentBody}>
                        {/* Dark Rounded Comment Bubble */}
                        <View style={styles.fbBubble}>
                          <Text style={styles.fbUsername}>{comment.user}</Text>
                          <Text style={styles.fbCommentText}>{comment.content}</Text>
                        </View>

                        {/* Bottom Action Row (Time, Thích, Phản hồi) */}
                        <View style={styles.fbActionRow}>
                          <Text style={styles.fbTimeText}>{comment.time}</Text>

                          <TouchableOpacity
                            style={styles.fbActionBtn}
                            activeOpacity={0.7}
                            onPress={() => handleLikeComment(comment.id)}
                          >
                            <Text
                              style={[
                                styles.fbActionText,
                                comment.isLiked && styles.fbActionTextLiked,
                              ]}
                            >
                              Thích {comment.likes > 0 ? `(${comment.likes})` : ''}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.fbActionBtn}
                            activeOpacity={0.7}
                            onPress={() => handleStartReply(comment.id, comment.user)}
                          >
                            <Text style={styles.fbActionText}>Phản hồi</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* 2. NESTED CHILD REPLIES (FACEBOOK THREAD) */}
                    {comment.replies && comment.replies.length > 0 && (
                      <View style={styles.fbRepliesContainer}>
                        {/* Replies count toggle button if folded */}
                        {comment.replies.length > 1 && !comment.isRepliesExpanded && (
                          <TouchableOpacity
                            style={styles.fbViewRepliesToggle}
                            activeOpacity={0.7}
                            onPress={() => handleToggleExpandReplies(comment.id)}
                          >
                            <Ionicons name="arrow-undo-sharp" size={14} color="rgba(255, 255, 255, 0.55)" style={{ transform: [{ rotate: '180deg' }] }} />
                            <Text style={styles.fbViewRepliesToggleText}>
                              Xem tất cả {comment.replies.length} phản hồi
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* Render Reply Items when expanded */}
                        {(comment.isRepliesExpanded !== false) &&
                          comment.replies.map((reply) => (
                            <View key={reply.id} style={styles.fbReplyRow}>
                              <Image source={{ uri: reply.avatar }} style={styles.fbReplyAvatar} />

                              <View style={styles.fbCommentBody}>
                                {/* Reply Bubble */}
                                <View style={styles.fbBubble}>
                                  <Text style={styles.fbUsername}>{reply.user}</Text>
                                  <Text style={styles.fbCommentText}>{reply.content}</Text>
                                </View>

                                {/* Reply Actions */}
                                <View style={styles.fbActionRow}>
                                  <Text style={styles.fbTimeText}>{reply.time}</Text>

                                  <TouchableOpacity
                                    style={styles.fbActionBtn}
                                    activeOpacity={0.7}
                                    onPress={() => handleLikeReply(comment.id, reply.id)}
                                  >
                                    <Text
                                      style={[
                                        styles.fbActionText,
                                        reply.isLiked && styles.fbActionTextLiked,
                                      ]}
                                    >
                                      Thích {reply.likes > 0 ? `(${reply.likes})` : ''}
                                    </Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={styles.fbActionBtn}
                                    activeOpacity={0.7}
                                    onPress={() => handleStartReply(comment.id, reply.user)}
                                  >
                                    <Text style={styles.fbActionText}>Phản hồi</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          ))}

                        {/* Hide replies button */}
                        {comment.replies.length > 1 && comment.isRepliesExpanded && (
                          <TouchableOpacity
                            style={styles.fbHideRepliesToggle}
                            activeOpacity={0.7}
                            onPress={() => handleToggleExpandReplies(comment.id)}
                          >
                            <Text style={styles.fbHideRepliesToggleText}>— Ẩn bớt phản hồi</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Replying To Banner (Facebook Style) */}
              {replyingTo && (
                <View style={styles.replyingBanner}>
                  <Text style={styles.replyingText}>
                    Đang trả lời <Text style={styles.replyingUsername}>{replyingTo.username}</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setReplyingTo(null);
                      setCommentInput('');
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.6)" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Bottom Floating Comment Input Bar */}
              <View style={styles.commentInputBar}>
                {/* Input Pill Container with Emoji Button */}
                <View style={styles.commentPillWrapper}>
                  <TextInput
                    ref={commentInputRef}
                    style={styles.commentTextInput}
                    value={commentInput}
                    onChangeText={setCommentInput}
                    placeholder={
                      replyingTo
                        ? `Trả lời ${replyingTo.username}...`
                        : 'Để lại bình luận thân thiện(°▽°)~'
                    }
                    placeholderTextColor="rgba(255, 255, 255, 0.45)"
                    multiline={false}
                    returnKeyType="send"
                    onSubmitEditing={handleSendComment}
                  />
                  <TouchableOpacity
                    style={styles.emojiBtn}
                    activeOpacity={0.7}
                    onPress={() => setCommentInput((prev) => prev + ' (◠‿◠) ')}
                  >
                    <Ionicons name="happy-outline" size={21} color="rgba(255, 255, 255, 0.65)" />
                  </TouchableOpacity>
                </View>

                {/* Circular Blue Send Button */}
                <TouchableOpacity
                  style={[
                    styles.sendCircleBtn,
                    !commentInput.trim() && styles.sendCircleBtnDisabled,
                  ]}
                  disabled={!commentInput.trim()}
                  onPress={handleSendComment}
                  activeOpacity={0.8}
                >
                  <Ionicons name="paper-plane" size={17} color="#FFFFFF" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
        </>
      )}

      {/* ============================================================= */}
      {/* 5. MODAL: TOÀN BỘ CÁC TẬP PHIM (ALL EPISODES BOTTOM SHEET)   */}
      {/* ============================================================= */}
      <Modal
        visible={isAllEpisodesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAllEpisodesModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsAllEpisodesModalVisible(false)}
        >
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHeader}>
              <View>
                <Text style={styles.bottomSheetTitle}>Danh Sách Tập Phim</Text>
                <Text style={styles.bottomSheetSubtitle}>Mùa 2 • Trọn bộ 12 tập</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAllEpisodesModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color={CinemaColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.allEpisodesListContent}
            >
              {SEASON_2_EPISODES.map((ep) => {
                const isActive = ep.id === selectedEpisodeId;
                return (
                  <TouchableOpacity
                    key={ep.id}
                    style={[
                      styles.fullEpisodeRow,
                      isActive && styles.fullEpisodeRowActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectEpisode(ep)}
                  >
                    <View style={styles.fullEpisodeThumbWrapper}>
                      <Image source={{ uri: ep.thumbnail }} style={styles.fullEpisodeThumb} />
                      <Text style={styles.fullEpisodeDuration}>{ep.duration}</Text>
                    </View>

                    <View style={styles.fullEpisodeInfo}>
                      <View style={styles.fullEpisodeTitleRow}>
                        <Text
                          style={[
                            styles.fullEpisodeTitle,
                            isActive && { color: CinemaColors.primary, fontWeight: '800' },
                          ]}
                          numberOfLines={1}
                        >
                          {ep.title}
                        </Text>
                        {ep.isVip && (
                          <View style={styles.vipTagPill}>
                            <Text style={styles.vipTagPillText}>VIP</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.fullEpisodeStatus}>
                        {isActive ? 'Đang phát ngay bây giờ' : 'Chạm để xem tập này'}
                      </Text>
                    </View>

                    {isActive && (
                      <Ionicons name="stats-chart" size={18} color={CinemaColors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ============================================================= */}
      {/* 6. MODAL: CHỌN ĐỘ PHÂN GIẢI (QUALITY SELECTOR)              */}
      {/* ============================================================= */}
      <Modal
        visible={isQualityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsQualityModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsQualityModalVisible(false)}
        >
          <View style={styles.qualityModalCard}>
            <Text style={styles.qualityModalTitle}>Chất Lượng Video</Text>

            {['4K Ultra HD (VIP)', '1080P Full HD', '720P HD', '480P Tiết Kiệm'].map((q) => {
              const cleanQ = q.split(' ')[0];
              const isSelected = selectedQuality.includes(cleanQ);
              return (
                <TouchableOpacity
                  key={q}
                  style={styles.qualityOptionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedQuality(cleanQ);
                    setIsQualityModalVisible(false);
                    Alert.alert('Đổi chất lượng', `Đã chuyển sang độ phân giải ${q}`);
                  }}
                >
                  <Text style={[styles.qualityOptionText, isSelected && styles.qualityOptionTextActive]}>
                    {q}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={CinemaColors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },

  /* ---------------- VIDEO PLAYER CONTAINER ---------------- */
  videoPlayerContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  videoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoTouchOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'space-between',
    padding: 10,
  },
  playerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerIconButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerMovieTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  playerTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playerCenterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  playerSeekBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekSecondsText: {
    fontSize: 9.5,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: -2,
  },
  playerPlayPauseBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 51, 75, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerTimeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playerTimelineTrack: {
    flex: 1,
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  playerTimelineFill: {
    height: '100%',
    backgroundColor: CinemaColors.primary,
    borderRadius: 2,
  },
  playerTimelineThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginLeft: -5,
  },
  qualityButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  qualityButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullscreenBtn: {
    padding: 2,
  },

  /* ---------------- TABS: GIỚI THIỆU / BÌNH LUẬN ---------------- */
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative',
  },
  tabButtonActive: {},
  tabButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: CinemaColors.textMuted,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  commentCountText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: CinemaColors.textMuted,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  /* ---------------- SCROLL CONTENT ---------------- */
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: '#000000',
  },

  /* Title Section */
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 6,
  },
  viewsAndMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  viewsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 13,
    color: CinemaColors.textSecondary,
    fontWeight: '600',
  },
  synopsisCard: {
    backgroundColor: CinemaColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  synopsisText: {
    fontSize: 12.5,
    color: CinemaColors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaTagsRow: {
    gap: 2,
  },
  metaTagText: {
    fontSize: 11,
    color: CinemaColors.textMuted,
  },

  /* Badges */
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  pinkPremiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B52857',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pinkPremiumText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Action Buttons Bar */
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
  },
  actionCol: {
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    fontWeight: '500',
  },

  /* ---------------- EPISODES SECTION ---------------- */
  episodesSection: {
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  episodesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  episodesHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  allEpisodesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  allEpisodesText: {
    fontSize: 12.5,
    color: CinemaColors.textSecondary,
    fontWeight: '600',
  },
  seasonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 12,
  },
  seasonTab: {
    paddingBottom: 4,
  },
  seasonTabActive: {},
  seasonTabText: {
    fontSize: 14,
    color: CinemaColors.textMuted,
    fontWeight: '600',
  },
  seasonTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  episodesHorizontalList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  episodeBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1E2028',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  episodeBoxActive: {
    backgroundColor: '#0F2744',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  episodeBoxNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  episodeBoxNumberActive: {
    color: '#60A5FA',
    fontWeight: '800',
  },

  /* ---------------- RECOMMENDATIONS SECTION ---------------- */
  recommendationsSection: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  recommendationsHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  recCard: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  recThumbnailWrapper: {
    width: 145,
    height: 82,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surface,
  },
  recThumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recBottomBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recBottomBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recInfoCol: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  recTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  recTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  recTagBadge: {
    backgroundColor: '#1E2028',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recTagText: {
    fontSize: 10,
    color: CinemaColors.textSecondary,
  },
  recViewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recViewsText: {
    fontSize: 11,
    color: CinemaColors.textMuted,
  },

  /* ---------------- FACEBOOK STYLE COMMENTS TAB ---------------- */
  commentsKeyboardContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  commentsListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  fbCommentThreadContainer: {
    marginBottom: 16,
  },
  fbCommentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  fbCommentBody: {
    flex: 1,
  },
  fbBubble: {
    backgroundColor: '#1E2028',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    maxWidth: '96%',
  },
  fbUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fbCommentText: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 19,
  },
  fbActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 8,
    paddingTop: 4,
  },
  fbTimeText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
  },
  fbActionBtn: {},
  fbActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  fbActionTextLiked: {
    color: CinemaColors.primary,
  },

  /* Nested Replies Container (Facebook Style Indentation) */
  fbRepliesContainer: {
    marginLeft: 42,
    marginTop: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: 10,
    gap: 12,
  },
  fbReplyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fbReplyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  fbViewRepliesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  fbViewRepliesToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.55)',
  },
  fbHideRepliesToggle: {
    paddingVertical: 2,
  },
  fbHideRepliesToggleText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
  },

  /* Replying Banner Above Input */
  replyingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161822',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  replyingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  replyingUsername: {
    color: CinemaColors.primary,
    fontWeight: '700',
  },

  /* Comment Input Bar Matching Screenshot */
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#12141C',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  commentPillWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2028',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  commentTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    paddingVertical: 2,
  },
  emojiBtn: {
    paddingLeft: 6,
  },
  sendCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendCircleBtnDisabled: {
    backgroundColor: 'rgba(0, 132, 255, 0.4)',
  },

  /* ---------------- MODAL BOTTOM SHEET ---------------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#161822',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 30,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  bottomSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bottomSheetSubtitle: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    marginTop: 2,
  },
  allEpisodesListContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  fullEpisodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CinemaColors.surface,
    borderRadius: 10,
    padding: 8,
    gap: 12,
  },
  fullEpisodeRowActive: {
    borderWidth: 1,
    borderColor: CinemaColors.primary,
    backgroundColor: 'rgba(255, 51, 75, 0.08)',
  },
  fullEpisodeThumbWrapper: {
    width: 100,
    height: 58,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  fullEpisodeThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fullEpisodeDuration: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  fullEpisodeInfo: {
    flex: 1,
  },
  fullEpisodeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  fullEpisodeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  vipTagPill: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  vipTagPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullEpisodeStatus: {
    fontSize: 11,
    color: CinemaColors.textMuted,
  },

  /* Quality Modal */
  qualityModalCard: {
    backgroundColor: '#161822',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    gap: 8,
  },
  qualityModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  qualityOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: CinemaColors.surface,
    borderRadius: 10,
  },
  qualityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  qualityOptionTextActive: {
    color: CinemaColors.primary,
    fontWeight: '700',
  },
});
