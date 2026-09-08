import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';
import { Pagination } from '@/components/pagination';

const INITIAL_FAVORITES = [
  {
    id: 'fav-1',
    title: 'Avatar: Dòng Chảy Của Nước',
    rating: '8.9',
    quality: '4K Ultra HD',
    year: '2024',
    type: 'movies',
    genres: 'Khoa Học Viễn Tưởng',
    duration: '3h 12m',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-2',
    title: 'Interstellar: Hố Đen Tử Thần',
    rating: '9.2',
    quality: '4K HDR',
    year: '2024',
    type: 'movies',
    genres: 'Khoa Học Viễn Tưởng',
    duration: '2h 49m',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-3',
    title: 'Deadpool & Wolverine',
    rating: '8.9',
    quality: '4K HDR',
    year: '2024',
    type: 'movies',
    genres: 'Hành Động • Hài',
    duration: '2h 08m',
    image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-4',
    title: 'Stranger Things 5',
    rating: '8.8',
    quality: 'Dolby Vision',
    year: '2024',
    type: 'series',
    genres: 'Kinh Dị • Bí Ẩn',
    duration: 'Tập Mới',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-5',
    title: 'John Wick: Chapter 4',
    rating: '8.6',
    quality: '4K HDR',
    year: '2023',
    type: 'movies',
    genres: 'Hành Động',
    duration: '2h 49m',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-6',
    title: 'Dune: Hành Tinh Cát 2',
    rating: '8.7',
    quality: '4K IMAX',
    year: '2024',
    type: 'movies',
    genres: 'Viễn Tưởng',
    duration: '2h 46m',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-7',
    title: 'The Last of Us',
    rating: '9.0',
    quality: '4K HDR',
    year: '2023',
    type: 'series',
    genres: 'Hành Động • Sinh Tồn',
    duration: 'Season 1',
    image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-8',
    title: 'Oppenheimer',
    rating: '9.1',
    quality: '4K IMAX',
    year: '2023',
    type: 'downloaded',
    genres: 'Lịch Sử • Kịch Tính',
    duration: '3h 00m',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-9',
    title: 'Cyberpunk: Edgerunners',
    rating: '8.9',
    quality: 'Full HD',
    year: '2023',
    type: 'series',
    genres: 'Hoạt Hình • Viễn Tưởng',
    duration: '10 Tập',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-10',
    title: 'Spider-Man: Across Spider-Verse',
    rating: '9.0',
    quality: '4K UHD',
    year: '2023',
    type: 'downloaded',
    genres: 'Hoạt Hình • Siêu Anh Hùng',
    duration: '2h 20m',
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-11',
    title: 'House of the Dragon',
    rating: '8.8',
    quality: '4K HDR',
    year: '2024',
    type: 'series',
    genres: 'Giả Tưởng • Kịch Tính',
    duration: 'Season 2',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-12',
    title: 'The Batman',
    rating: '8.5',
    quality: '4K UHD',
    year: '2022',
    type: 'movies',
    genres: 'Hành Động • Trinh Thám',
    duration: '2h 56m',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-13',
    title: 'Loki Season 2',
    rating: '8.7',
    quality: '4K HDR',
    year: '2023',
    type: 'series',
    genres: 'Hành Động • Phiêu Lưu',
    duration: '6 Tập',
    image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'fav-14',
    title: 'Top Gun: Maverick',
    rating: '8.9',
    quality: '4K IMAX',
    year: '2022',
    type: 'downloaded',
    genres: 'Hành Động • Đua Bay',
    duration: '2h 10m',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
  },
];

const FILTER_TABS = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'movies', label: 'Phim Lẻ' },
  { id: 'series', label: 'Phim Bộ' },
  { id: 'downloaded', label: 'Đã Tải' },
];

export default function FavoriteScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numColumns = isTablet ? 4 : 2;
  const PAGE_SIZE = isTablet ? 12 : 6;
  const GAP = 14;
  const HORIZONTAL_PADDING = 20 * 2;
  const cardWidth = (width - HORIZONTAL_PADDING - (numColumns - 1) * GAP) / numColumns;
  const cardHeight = cardWidth * 1.45;

  const flatListRef = useRef<FlatList>(null);

  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);
  const [selectedTab, setSelectedTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset current page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  const filteredFavorites = useMemo(() => {
    if (selectedTab === 'all') return favorites;
    return favorites.filter((item) => item.type === selectedTab);
  }, [favorites, selectedTab]);

  const totalPages = Math.ceil(filteredFavorites.length / PAGE_SIZE);

  const paginatedFavorites = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredFavorites.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredFavorites, currentPage, PAGE_SIZE]);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Phim Yêu Thích</Text>
          <Text style={styles.headerSubtitle}>{filteredFavorites.length} bộ phim đã lưu</Text>
        </View>

        <TouchableOpacity style={styles.searchButton} activeOpacity={0.75}>
          <Ionicons name="search" size={20} color={CinemaColors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        {FILTER_TABS.map((tab) => {
          const isSelected = selectedTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterTab, isSelected && styles.filterTabActive]}
              onPress={() => setSelectedTab(tab.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterTabText, isSelected && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Favorite Movie Grid */}
      {filteredFavorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-dislike-outline" size={48} color={CinemaColors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có phim yêu thích</Text>
          <Text style={styles.emptySubtitle}>
            Hãy khám phá kho phim và bấm nút "Danh Sách" để lưu lại những bộ phim bạn yêu thích.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.replace('/(tabs)' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="film-outline" size={18} color="#FFFFFF" />
            <Text style={styles.exploreButtonText}>Khám Phá Ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          key={`grid-${numColumns}`}
          data={paginatedFavorites}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.movieCard, { width: cardWidth }]}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/movie/[id]', params: { id: item.id } })}
            >
              {/* Poster Image */}
              <View style={[styles.posterWrapper, { width: cardWidth, height: cardHeight }]}>
                <Image source={{ uri: item.image }} style={styles.posterImage} />

                {/* Quality Tag */}
                <View style={styles.qualityTag}>
                  <Text style={styles.qualityText}>{item.quality}</Text>
                </View>

                {/* Remove Bookmark Button */}
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => removeFavorite(item.id)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="heart" size={16} color={CinemaColors.primary} />
                </TouchableOpacity>

                {/* Play Icon Overlay on press */}
                <View style={styles.playButtonMini}>
                  <Ionicons name="play" size={14} color="#FFFFFF" />
                </View>
              </View>

              {/* Title & Info */}
              <Text style={styles.movieTitle} numberOfLines={1}>
                {item.title}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.movieYear}>{item.year}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            totalPages > 1 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={1}
              />
            ) : null
          }
        />
      )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    marginTop: 2,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: CinemaColors.surface,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  filterTabActive: {
    backgroundColor: CinemaColors.primary,
    borderColor: CinemaColors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  movieCard: {},
  posterWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surface,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  qualityTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  qualityText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonMini: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CinemaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CinemaColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  movieTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginTop: 8,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movieYear: {
    fontSize: 11,
    color: CinemaColors.textSecondary,
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 51, 75, 0.25)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: CinemaColors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CinemaColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
