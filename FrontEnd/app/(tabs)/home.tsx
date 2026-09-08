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
  FlatList,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';
import { BrandLogo } from '@/components/brand-logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -------------------------------------------------------------
// DỮ LIỆU MẪU PHIM ĐỈNH CAO (CINEMA MOCK DATA)
// -------------------------------------------------------------
const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'movie', name: 'Phim Lẻ' },
  { id: 'series', name: 'Phim Bộ' },
  { id: 'cinema', name: 'Chiếu Rạp' },
  { id: 'anime', name: 'Anime' },
  { id: 'action', name: 'Hành Động' },
];

const FEATURED_MOVIES = [
  {
    id: 'feat-1',
    title: 'AVATAR: DÒNG CHẢY CỦA NƯỚC',
    originalTitle: 'Avatar: The Way of Water',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    tag: 'TOP 1 THỊNH HÀNH HÔM NAY',
    rating: '8.9',
    year: '2024',
    duration: '3h 12m',
    age: '13+',
    quality: '4K Ultra HD',
    genres: ['Khoa Học Viễn Tưởng', 'Phiêu Lưu', 'Hành Động'],
    description: 'Trở lại thế giới diệu kỳ Pandora khi gia đình Sully đối mặt với hiểm nguy mới từ người Trái Đất.',
  },
  {
    id: 'feat-2',
    title: 'INTERSTELLAR: HỐ ĐEN TỬ THẦN',
    originalTitle: 'Interstellar',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    tag: 'SIÊU PHẨM CHIẾU RẠP',
    rating: '9.2',
    year: '2024',
    duration: '2h 49m',
    age: '13+',
    quality: '4K HDR',
    genres: ['Khoa Học Viễn Tưởng', 'Kịch Tính', 'Phiêu Lưu'],
    description: 'Một đoàn thám hiểm du hành qua hố sâu không gian để tìm kiếm hành tinh mới cho nhân loại.',
  },
  {
    id: 'feat-3',
    title: 'DEADPOOL & WOLVERINE',
    originalTitle: 'Deadpool & Wolverine',
    backdrop: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=1200&auto=format&fit=crop',
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    tag: 'BOM TẤN HÀI HÀNH ĐỘNG',
    rating: '8.9',
    year: '2024',
    duration: '2h 08m',
    age: '18+',
    quality: 'Dolby Vision',
    genres: ['Hành Động', 'Hài Hước', 'Sci-Fi'],
    description: 'Cặp đôi bất đắc dĩ Marvel cùng nhau quẩy tung đa vũ trụ trong trận chiến cứu lấy dòng thời gian.',
  },
  {
    id: 'feat-4',
    title: 'DUNE: HÀNH TINH CÁT 2',
    originalTitle: 'Dune: Part Two',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
    tag: 'ĐOẠT NHIỀU GIẢI THƯỞNG',
    rating: '8.7',
    year: '2024',
    duration: '2h 46m',
    age: '16+',
    quality: '4K IMAX',
    genres: ['Hành Động', 'Phiêu Lưu', 'Kịch Tính'],
    description: 'Paul Atreides gia nhập tộc Fremen để trả thù những kẻ đã hủy hoại gia đình anh.',
  },
];

const CONTINUE_WATCHING = [
  {
    id: 'cw-1',
    title: 'Dune: Hành Tinh Cát - Phần 2',
    episode: 'Tập 1',
    progress: 0.68,
    durationLeft: '42 phút còn lại',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'cw-2',
    title: 'Oppenheimer',
    episode: 'Bản Đầy Đủ',
    progress: 0.35,
    durationLeft: '1h 45m còn lại',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'cw-3',
    title: 'Spider-Man: Across the Spider-Verse',
    episode: 'Phim Lẻ',
    progress: 0.85,
    durationLeft: '18 phút còn lại',
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop',
  },
];

const TRENDING_MOVIES = [
  {
    id: 'tr-1',
    rank: 1,
    title: 'Interstellar: Hố Đen Tử Thần',
    rating: '9.2',
    quality: '4K HDR',
    year: '2024',
    genres: ['Khoa Học Viễn Tưởng', 'Phiêu Lưu'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tr-2',
    rank: 2,
    title: 'Deadpool & Wolverine',
    rating: '8.9',
    quality: '4K HDR',
    year: '2024',
    genres: ['Hành Động', 'Hài Hước'],
    image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tr-3',
    rank: 3,
    title: 'Stranger Things 5',
    rating: '8.8',
    quality: 'Dolby Vision',
    year: '2024',
    genres: ['Kinh Dị', 'Bí Ẩn'],
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tr-4',
    rank: 4,
    title: 'John Wick: Chapter 4',
    rating: '8.6',
    quality: '4K HDR',
    year: '2023',
    genres: ['Hành Động', 'Tội Phạm'],
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tr-5',
    rank: 5,
    title: 'The Dark Knight',
    rating: '9.4',
    quality: '4K Ultra HD',
    year: '2024',
    genres: ['Hành Động', 'Kịch Tính'],
    image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tr-6',
    rank: 6,
    title: 'Dune: Hành Tinh Cát 2',
    rating: '8.7',
    quality: '4K HDR',
    year: '2024',
    genres: ['Viễn Tưởng', 'Phiêu Lưu'],
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
  },
];

const NEW_RELEASES = [
  {
    id: 'nr-1',
    title: 'Cyberpunk: Edgerunners',
    rating: '9.0',
    quality: 'HD',
    year: '2024',
    genres: ['Anime', 'Hành Động'],
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'nr-2',
    title: 'Lật Mặt 7: Một Điều Ước',
    rating: '8.5',
    quality: 'Full HD',
    year: '2024',
    genres: ['Gia Đình', 'Tình Cảm'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'nr-3',
    title: 'Kẻ Trộm Mặt Trăng 4',
    rating: '8.1',
    quality: '4K HDR',
    year: '2024',
    genres: ['Hoạt Hình', 'Hài Hước'],
    image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'nr-4',
    title: 'Godzilla x Kong',
    rating: '8.0',
    quality: '4K Ultra HD',
    year: '2024',
    genres: ['Hành Động', 'Quái Vật'],
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=500&auto=format&fit=crop',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const heroFlatListRef = useRef<FlatList>(null);
  const activeHeroIndexRef = useRef(activeHeroIndex);
  activeHeroIndexRef.current = activeHeroIndex;

  // Tự động cuộn sang phim tiếp theo sau mỗi 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      if (!FEATURED_MOVIES.length) return;
      const nextIndex = (activeHeroIndexRef.current + 1) % FEATURED_MOVIES.length;
      heroFlatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveHeroIndex(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleHeroScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index >= 0 && index < FEATURED_MOVIES.length && index !== activeHeroIndex) {
      setActiveHeroIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* ----------------- TOP APP BAR ----------------- */}
      <View style={styles.appBar}>
        <BrandLogo layout="horizontal" size="small" showTagline={false} />

        <View style={styles.appBarActions}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="search" size={22} color={CinemaColors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={CinemaColors.textPrimary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.avatarButton} activeOpacity={0.8}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' }}
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ----------------- HERO FEATURED BANNER (SWIPEABLE CAROUSEL) ----------------- */}
        <View style={styles.heroCarouselContainer}>
          <FlatList
            ref={heroFlatListRef}
            data={FEATURED_MOVIES}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleHeroScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="center"
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                heroFlatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                });
              }, 100);
            }}
            renderItem={({ item }) => {
              const isSaved = bookmarkedIds.includes(item.id);
              return (
                <View style={styles.heroBannerSlide}>
                  <Image
                    source={{ uri: item.backdrop }}
                    style={styles.heroBackdrop}
                  />

                  {/* Hero Bottom Gradient for readability */}
                  {/* <View style={styles.heroBottomGradient} /> */}

                  {/* Hero Content */}
                  <View style={styles.heroContent}>
                    {/* Trending / Highlight Tag */}
                    <View style={styles.trendingBadge}>
                      <Ionicons name="flame" size={14} color="#FFF" />
                      <Text style={styles.trendingBadgeText}>{item.tag}</Text>
                    </View>

                    {/* Movie Title */}
                    <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>

                    {/* Meta Tags */}
                    <View style={styles.heroMetaRow}>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                      <Text style={styles.heroMetaText}>{item.year}</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.heroMetaText}>{item.duration}</Text>
                      <View style={styles.metaDot} />
                      <View style={styles.qualityBadge}>
                        <Text style={styles.qualityText}>{item.quality}</Text>
                      </View>
                    </View>

                    {/* Genres */}
                    <Text style={styles.heroGenres}>
                      {item.genres.join(' • ')}
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.heroActionRow}>
                      <TouchableOpacity
                        style={styles.playButton}
                        activeOpacity={0.85}
                        onPress={() => {}}
                      >
                        <Ionicons name="play" size={20} color="#FFFFFF" />
                        <Text style={styles.playButtonText}>Xem Ngay</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.myListButton, isSaved && styles.myListButtonActive]}
                        activeOpacity={0.8}
                        onPress={() => toggleBookmark(item.id)}
                      >
                        <Ionicons
                          name={isSaved ? 'checkmark' : 'add'}
                          size={22}
                          color={CinemaColors.textPrimary}
                        />
                        <Text style={styles.myListButtonText}>
                          {isSaved ? 'Đã Lưu' : 'Danh Sách'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.infoCircleButton} activeOpacity={0.8}>
                        <Ionicons name="information-circle-outline" size={24} color={CinemaColors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />

          {/* Pagination Indicators (Dots / Pills) */}
          <View style={styles.paginationDotsContainer}>
            {FEATURED_MOVIES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.paginationDot,
                  activeHeroIndex === idx && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>
{/* ----------------- CATEGORY FILTER PILLS ----------------- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillSelected,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {/* ----------------- CONTINUE WATCHING ----------------- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBarAccent} />
              <Text style={styles.sectionTitle}>Tiếp Tục Xem</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={CONTINUE_WATCHING}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.continueCard} activeOpacity={0.85}>
                <View style={styles.continueImageWrapper}>
                  <Image source={{ uri: item.image }} style={styles.continueImage} />
                  <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={36} color="#FFFFFF" />
                  </View>
                  {/* Progress bar */}
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
                  </View>
                </View>
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.continueMeta}>
                    <Text style={styles.continueEpisode}>{item.episode}</Text>
                    <Text style={styles.continueDuration}>{item.durationLeft}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ----------------- PHIM THỊNH HÀNH ----------------- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBarAccent} />
              <Text style={styles.sectionTitle}>Phim Thịnh Hành</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={TRENDING_MOVIES}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={styles.trendingCard} activeOpacity={0.85}>
                {/* Poster Image */}
                <Image source={{ uri: item.image }} style={styles.trendingPosterImage} />

                {/* Dark Gradient / Shadow Overlay for text readability */}
                {/* <View style={styles.trendingBottomGradient} /> */}

                {/* Góc trên phía trái: Banner TOP 1, TOP 2, ... */}
                <View style={styles.trendingTopBadge}>
                  <Text style={styles.trendingTopBadgeText}>TOP {index + 1}</Text>
                </View>

                {/* Góc trên phía phải: Tổng sao đánh giá */}
                <View style={styles.trendingRatingBadge}>
                  <Ionicons name="star" size={11} color="#FFD700" />
                  <Text style={styles.trendingRatingText}>{item.rating}</Text>
                </View>

                {/* Góc dưới phía trái: 2 thể loại gần nhất và tên phim */}
                <View style={styles.trendingBottomContent}>
                  {item.genres && item.genres.length > 0 && (
                    <Text style={styles.trendingGenresText} numberOfLines={1}>
                      {item.genres.slice(0, 2).join(' • ')}
                    </Text>
                  )}
                  <Text style={styles.trendingTitleText} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>


        {/* ----------------- PHIM MỚI RA ----------------- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBarAccent} />
              <Text style={styles.sectionTitle}>Phim Mới Ra</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={NEW_RELEASES}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.moviePosterCard} activeOpacity={0.85}>
                <View style={styles.moviePosterWrapper}>
                  <Image source={{ uri: item.image }} style={styles.moviePosterImage} />
                  <View style={styles.movieQualityTag}>
                    <Text style={styles.movieQualityText}>{item.quality}</Text>
                  </View>
                </View>
                <Text style={styles.moviePosterTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.moviePosterMetaRow}>
                  <Text style={styles.moviePosterYear}>{item.year}</Text>
                  <View style={styles.moviePosterRating}>
                    <Ionicons name="star" size={11} color="#FFD700" />
                    <Text style={styles.moviePosterRatingText}>{item.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ----------------- GỢI Ý PHIM ----------------- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBarAccent} />
              <Text style={styles.sectionTitle}>Gợi Ý Phim</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={NEW_RELEASES}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.moviePosterCard} activeOpacity={0.85}>
                <View style={styles.moviePosterWrapper}>
                  <Image source={{ uri: item.image }} style={styles.moviePosterImage} />
                  <View style={styles.movieQualityTag}>
                    <Text style={styles.movieQualityText}>{item.quality}</Text>
                  </View>
                </View>
                <Text style={styles.moviePosterTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.moviePosterMetaRow}>
                  <Text style={styles.moviePosterYear}>{item.year}</Text>
                  <View style={styles.moviePosterRating}>
                    <Ionicons name="star" size={11} color="#FFD700" />
                    <Text style={styles.moviePosterRatingText}>{item.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        {/* Spacer for bottom tab bar */}
        {/* <View style={{ height: 40 }} /> */}
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
    paddingBottom: 15,
  },
  /* Top App Bar */
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: CinemaColors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CinemaColors.primary,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: CinemaColors.primary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  /* Categories */
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CinemaColors.surface,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  categoryPillSelected: {
    backgroundColor: CinemaColors.primary,
    borderColor: CinemaColors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  categoryTextSelected: {
    color: CinemaColors.textPrimary,
  },

  /* Hero Banner Carousel */
  heroCarouselContainer: {
    width: SCREEN_WIDTH,
    height: 450,
    position: 'relative',
    marginBottom: 16,
  },
  heroBannerSlide: {
    width: SCREEN_WIDTH,
    height: 450,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: 450,
  },
  heroBottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: 'rgba(9, 10, 15, 0.75)',
  },
  paginationDotsContainer: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  paginationDotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: CinemaColors.primary,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: CinemaColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    gap: 4,
  },
  trendingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
  },
  heroMetaText: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: CinemaColors.textMuted,
  },
  qualityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 4,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
  },
  heroGenres: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    marginBottom: 16,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    flex: 1,
    height: 48,
    backgroundColor: CinemaColors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: CinemaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  myListButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  myListButtonActive: {
    backgroundColor: 'rgba(255, 51, 75, 0.2)',
    borderColor: CinemaColors.primary,
  },
  myListButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: CinemaColors.textPrimary,
  },
  infoCircleButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  /* Sections */
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionBarAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: CinemaColors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.3,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: CinemaColors.primary,
  },
  horizontalListContent: {
    paddingHorizontal: 20,
    gap: 14,
  },

  /* Continue Watching Card */
  continueCard: {
    width: 220,
  },
  continueImageWrapper: {
    width: 220,
    height: 125,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surface,
  },
  continueImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  progressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: CinemaColors.primary,
  },
  continueInfo: {
    marginTop: 8,
  },
  continueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 3,
  },
  continueMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  continueEpisode: {
    fontSize: 11,
    color: CinemaColors.textSecondary,
  },
  continueDuration: {
    fontSize: 11,
    color: CinemaColors.primary,
    fontWeight: '600',
  },

  /* Trending Card (Phim Thịnh Hành) */
  trendingCard: {
    width: 160,
    height: 235,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surface,
  },
  trendingPosterImage: {
    width: '100%',
    height: '100%',
  },
  trendingBottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(9, 10, 15, 0.88)',
  },
  trendingTopBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: CinemaColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: CinemaColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  trendingTopBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  trendingRatingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 10, 15, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    gap: 3,
  },
  trendingRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
  },
  trendingBottomContent: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  trendingGenresText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B7D',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  trendingTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.2,
  },

  /* Movie Poster Card (Phim Mới Ra & Gợi Ý Phim) */
  moviePosterCard: {
    width: 125,
  },
  moviePosterWrapper: {
    width: 125,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surface,
  },
  moviePosterImage: {
    width: '100%',
    height: '100%',
  },
  movieQualityTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  movieQualityText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  moviePosterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginTop: 6,
  },
  moviePosterMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  moviePosterYear: {
    fontSize: 11,
    color: CinemaColors.textSecondary,
    fontWeight: '500',
  },
  moviePosterRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  moviePosterRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
  },
});
