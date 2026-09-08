import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { CinemaColors } from '@/constants/theme';
import { BrandLogo } from '@/components/brand-logo';
import { CommentsSection } from '@/components/comments-section';

// -------------------------------------------------------------
// DỮ LIỆU DIỄN VIÊN (CAST MOCK DATA)
// -------------------------------------------------------------
const CAST_DATA = [
  {
    id: 'cast-1',
    name: 'David Vance',
    role: 'Đại úy Eric',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'cast-2',
    name: 'Rebecca Solis',
    role: 'TS. Lyra',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'cast-3',
    name: 'Kenji Sato',
    role: 'Chỉ huy Kael',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'cast-4',
    name: 'Aria Chen',
    role: 'Kỹ sư Maya',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'cast-5',
    name: 'Dmitri Volkov',
    role: 'Phi công Alex',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop',
  },
];

// -------------------------------------------------------------
// DỮ LIỆU TÁC PHẨM TƯƠNG TỰ (SIMILAR MOVIES)
// -------------------------------------------------------------
const SIMILAR_MOVIES = [
  {
    id: 'sim-1',
    title: 'Chân Trời Vô Tận',
    rating: '8.7',
    quality: '4K UHD',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'sim-2',
    title: 'Nhật Thực Nhân Tạo',
    rating: '8.4',
    quality: '4K HDR',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'sim-3',
    title: 'Nghịch Lý Lượng Tử',
    rating: '9.1',
    quality: '4K IMAX',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'sim-4',
    title: 'Bí Ẩn Thiên Hà Đen',
    rating: '8.8',
    quality: '4K',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'sim-5',
    title: 'Vùng Đất Câm Lặng 3',
    rating: '8.6',
    quality: '4K UHD',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'sim-6',
    title: 'Vết Rạn Thời Gian',
    rating: '8.9',
    quality: 'Dolby Vision',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
  },
];

const GENRES = [
  'Hành động',
  'Khoa học viễn tưởng',
  'Giật gân kịch tính',
  'Phiêu lưu vũ trụ',
  'Bí ẩn siêu nhiên',
  'Khám phá thiên hà',
];

export default function MovieDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  const isTablet = width >= 768;
  const similarCardWidth = isTablet ? 150 : 120;

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Khám phá phim siêu phẩm NEBULA ODYSSEY trên ứng dụng CineStream!',
        title: 'NEBULA ODYSSEY (2024)',
      });
    } catch {
      // ignore
    }
  };

  const handleWatchMovie = () => {
    Alert.alert('Bắt đầu xem', 'Đang kết nối luồng phát 4K Ultra HD...');
  };

  const handleDownload = () => {
    setIsDownloaded(!isDownloaded);
    Alert.alert(
      isDownloaded ? 'Đã hủy tải' : 'Đang tải xuống',
      isDownloaded
        ? 'Đã xóa bản tải về của NEBULA ODYSSEY'
        : 'NEBULA ODYSSEY đang được tải về ở chất lượng 4K HDR'
    );
  };

  const handleWatchTogether = () => {
    Alert.alert('Xem Chung (Watch Party)', 'Tạo phòng xem chung và chia sẻ liên kết với bạn bè!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* ----------------- TOP NAVIGATION BAR ----------------- */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleIconButton}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={22} color={CinemaColors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <BrandLogo layout="horizontal" size="small" showTagline={false} />
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.circleIconButton}
            onPress={handleShare}
            activeOpacity={0.75}
          >
            <Ionicons name="share-social-outline" size={20} color={CinemaColors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/(tabs)/profile' as any)}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
              }}
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ----------------- HERO POSTER & TRAILER BANNER ----------------- */}
        <View style={styles.heroWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
            }}
            style={styles.heroBackdrop}
          />
          <View style={styles.heroDarkOverlay} />

          {/* Quality Tag Top-Right */}
          <View style={styles.qualityPill}>
            <View style={styles.neonDot} />
            <Text style={styles.qualityPillText}>4K UHD • HDR10+</Text>
          </View>

          {/* Glowing Play Button Center (Red Cinema Accent) */}
          <TouchableOpacity
            style={styles.heroPlayButton}
            onPress={handleWatchMovie}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        {/* ----------------- TITLE & METADATA ----------------- */}
        <View style={styles.infoSection}>
          {/* Badge Row */}
          <View style={styles.badgeRow}>
            <View style={styles.originalBadge}>
              <Text style={styles.originalBadgeText}>ORIGINAL</Text>
            </View>
            <View style={styles.trendingRow}>
              <Ionicons name="sparkles" size={13} color={CinemaColors.primary} />
              <Text style={styles.trendingText}>Xu hướng #1 Việt Nam</Text>
            </View>
          </View>

          {/* Main Title */}
          <Text style={styles.movieTitle}>NEBULA ODYSSEY</Text>

          {/* Meta Info Row */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>2024</Text>
            <Text style={styles.metaDot}>•</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>16+</Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>2g 18p</Text>
            <Text style={styles.metaDot}>•</Text>
            <View style={styles.audioRow}>
              <MaterialIcons name="surround-sound" size={16} color={CinemaColors.textTertiary} />
              <Text style={styles.audioText}>Dolby Atmos</Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={CinemaColors.primary} />
              <Text style={styles.ratingText}>8.9</Text>
            </View>
          </View>

          {/* Genre Pills (Horizontal Scroll) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreScrollContent}
            style={styles.genreScrollView}
          >
            {GENRES.map((genre, index) => (
              <View key={index} style={styles.genrePill}>
                <Text style={styles.genrePillText}>{genre}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Primary Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.watchNowButton}
              onPress={handleWatchMovie}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.watchNowText}>Xem Phim</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.downloadButton, isDownloaded && styles.downloadButtonActive]}
              onPress={handleDownload}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isDownloaded ? 'checkmark-circle' : 'arrow-down'}
                size={19}
                color="#FFFFFF"
              />
              <Text style={styles.downloadButtonText}>
                {isDownloaded ? 'Đã Tải Xong' : 'Tải Xuống'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4 Quick Action Bar */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => Alert.alert('Trailer', 'Đang phát Trailer chính thức NEBULA ODYSSEY')}
              activeOpacity={0.75}
            >
              <View style={styles.quickActionIconCircle}>
                <Ionicons name="film-outline" size={20} color={CinemaColors.textPrimary} />
              </View>
              <Text style={styles.quickActionLabel}>Trailer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => setIsFavorite(!isFavorite)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.quickActionIconCircle,
                  isFavorite && styles.quickActionIconCircleActive,
                ]}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'add'}
                  size={20}
                  color={isFavorite ? CinemaColors.primary : CinemaColors.textPrimary}
                />
              </View>
              <Text style={styles.quickActionLabel}>
                {isFavorite ? 'Đã thích' : 'Yêu thích'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => Alert.alert('Đánh giá', 'Đánh giá 5 sao cho siêu phẩm này!')}
              activeOpacity={0.75}
            >
              <View style={styles.quickActionIconCircle}>
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={20}
                  color={CinemaColors.textPrimary}
                />
              </View>
              <Text style={styles.quickActionLabel}>Đánh giá</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleWatchTogether}
              activeOpacity={0.75}
            >
              <View style={styles.quickActionIconCircle}>
                <Ionicons name="people-outline" size={20} color={CinemaColors.textPrimary} />
              </View>
              <Text style={styles.quickActionLabel}>Xem chung</Text>
            </TouchableOpacity>
          </View>

          {/* ----------------- SYNOPSIS (TÓM TẮT NỘI DUNG) ----------------- */}
          <View style={styles.synopsisSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Tóm tắt nội dung</Text>
              <View style={styles.qualityBadgeSmall}>
                <Text style={styles.qualityBadgeSmallText}>ĐỘ NÉT CAO</Text>
              </View>
            </View>

            <Text
              style={styles.synopsisText}
              numberOfLines={isSynopsisExpanded ? undefined : 3}
            >
              Vào năm 2184, sau khi tín hiệu cứu cứu kỳ bí truyền về từ ranh giới chòm sao
              Thiên Ưng, phi thuyền thám hiểm Odyssey khởi hành xuyên qua hố đen Nebula. Đối
              mặt với những hiện tượng vũ trụ siêu nhiên bẻ cong không - thời gian, phi hành
              đoàn phải tìm cách sinh tồn và giải mã bí mật cứu rỗi nền văn minh loài người.
            </Text>

            <TouchableOpacity
              onPress={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
              activeOpacity={0.7}
              style={styles.expandButton}
            >
              <Text style={styles.expandButtonText}>
                {isSynopsisExpanded ? 'Thu gọn ˄' : '... Xem thêm ⌵'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ----------------- CAST (DÀN DIỄN VIÊN) ----------------- */}
          <View style={styles.castSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.castTitleRow}>
                <Text style={styles.sectionTitle}>Dàn diễn viên</Text>
                <View style={styles.castCountBadge}>
                  <Text style={styles.castCountText}>14</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.castListContent}
            >
              {CAST_DATA.map((actor) => (
                <View key={actor.id} style={styles.castCard}>
                  <View style={styles.castAvatarRing}>
                    <Image source={{ uri: actor.avatar }} style={styles.castAvatar} />
                  </View>
                  <Text style={styles.castName} numberOfLines={1}>
                    {actor.name}
                  </Text>
                  <Text style={styles.castRole} numberOfLines={1}>
                    {actor.role}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ----------------- COMMENTS & REVIEWS SECTION ----------------- */}
          <CommentsSection
            targetId={id}
            targetType="movie"
            title="Bình luận & Đánh giá"
            showRatingPicker={true}
          />

          {/* ----------------- SIMILAR MOVIES (TÁC PHẨM TƯƠNG TỰ) ----------------- */}
          <View style={styles.similarSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Tác phẩm tương tự</Text>
              <Text style={styles.categorySubText}>Phim Sci-Fi chọn lọc</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarListContent}
            >
              {SIMILAR_MOVIES.map((movie) => (
                <TouchableOpacity
                  key={movie.id}
                  style={[styles.similarCard, { width: similarCardWidth }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    Alert.alert('Chuyển phim', `Bạn chọn phim ${movie.title}`);
                  }}
                >
                  <View
                    style={[
                      styles.similarPosterWrapper,
                      { width: similarCardWidth, height: similarCardWidth * 1.45 },
                    ]}
                  >
                    <Image source={{ uri: movie.image }} style={styles.similarPoster} />
                    <View style={styles.similarRatingBadge}>
                      <Ionicons name="star" size={10} color={CinemaColors.primary} />
                      <Text style={styles.similarRatingText}>{movie.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.similarTitle} numberOfLines={1}>
                    {movie.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CinemaColors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Top Navigation Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CinemaColors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  circleIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: CinemaColors.primary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  /* Hero Banner */
  heroWrapper: {
    width: '100%',
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CinemaColors.surface,
  },
  heroBackdrop: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 10, 15, 0.45)',
  },
  qualityPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 17, 26, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
    zIndex: 10,
  },
  neonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CinemaColors.primary,
  },
  qualityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CinemaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CinemaColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },

  /* Info Section */
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  originalBadge: {
    backgroundColor: CinemaColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: CinemaColors.primaryBorder,
  },
  originalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: CinemaColors.primary,
    letterSpacing: 0.8,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: CinemaColors.textTertiary,
  },
  movieTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 13,
    color: CinemaColors.textTertiary,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 12,
    color: CinemaColors.textMuted,
  },
  ageBadge: {
    backgroundColor: CinemaColors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  ageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  audioText: {
    fontSize: 12.5,
    color: CinemaColors.textTertiary,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: CinemaColors.primary,
  },

  /* Genre Pills */
  genreScrollView: {
    marginBottom: 20,
  },
  genreScrollContent: {
    gap: 8,
  },
  genrePill: {
    backgroundColor: CinemaColors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  genrePillText: {
    fontSize: 12,
    color: CinemaColors.textTertiary,
    fontWeight: '600',
  },

  /* Action Buttons */
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  watchNowButton: {
    flex: 1.2,
    height: 48,
    backgroundColor: CinemaColors.primary,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: CinemaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  watchNowText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  downloadButton: {
    flex: 1,
    height: 48,
    backgroundColor: CinemaColors.surface,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  downloadButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* 4 Quick Actions Bar */
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: CinemaColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    marginBottom: 26,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 6,
  },
  quickActionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CinemaColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  quickActionIconCircleActive: {
    borderColor: CinemaColors.primary,
    backgroundColor: CinemaColors.primaryLight,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },

  /* Synopsis */
  synopsisSection: {
    marginBottom: 26,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.2,
  },
  qualityBadgeSmall: {
    backgroundColor: CinemaColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: CinemaColors.primaryBorder,
  },
  qualityBadgeSmallText: {
    fontSize: 10,
    fontWeight: '800',
    color: CinemaColors.primary,
    letterSpacing: 0.6,
  },
  synopsisText: {
    fontSize: 13.5,
    lineHeight: 22,
    color: CinemaColors.textSecondary,
  },
  expandButton: {
    marginTop: 4,
  },
  expandButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.primary,
  },

  /* Cast */
  castSection: {
    marginBottom: 26,
  },
  castTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  castCountBadge: {
    backgroundColor: CinemaColors.surfaceElevated,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  castCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: CinemaColors.textSecondary,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: CinemaColors.primary,
  },
  castListContent: {
    paddingVertical: 6,
    gap: 16,
  },
  castCard: {
    alignItems: 'center',
    width: 80,
  },
  castAvatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: CinemaColors.primaryBorder,
    padding: 2,
    marginBottom: 6,
    backgroundColor: CinemaColors.surface,
  },
  castAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  castName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  castRole: {
    fontSize: 10,
    color: CinemaColors.textSecondary,
    textAlign: 'center',
  },

  /* Similar Movies */
  similarSection: {
    marginBottom: 20,
  },
  categorySubText: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    fontWeight: '500',
  },
  similarListContent: {
    paddingVertical: 8,
    gap: 14,
  },
  similarCard: {},
  similarPosterWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surface,
    marginBottom: 6,
  },
  similarPoster: {
    width: '100%',
    height: '100%',
  },
  similarRatingBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 2,
  },
  similarRatingText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: CinemaColors.primary,
  },
  similarTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
});
