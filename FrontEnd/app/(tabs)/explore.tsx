import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  useWindowDimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';
import { Pagination } from '@/components/pagination';
import { TopAppBar } from '@/components/top-app-bar';
import { MovieAPI } from '@/services/API';

export default function ExploreScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numColumns = isTablet ? 4 : 2;
  const PAGE_SIZE = isTablet ? 12 : 8;
  const GAP = 14;
  const HORIZONTAL_PADDING = 20 * 2;
  const cardWidth = (width - HORIZONTAL_PADDING - (numColumns - 1) * GAP) / numColumns;
  const cardHeight = cardWidth * 1.45;

  const flatListRef = useRef<FlatList>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMoviesCount, setTotalMoviesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Categories & Movies from Backend API
  const [categoryPills, setCategoryPills] = useState<Array<{ id: string; name: string }>>([
    { id: 'all', name: 'Tất cả' },
  ]);
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    MovieAPI.getCategories()
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          const dbCats = res.data.map((c: any) => ({ id: c.slug, name: c.name }));
          setCategoryPills([{ id: 'all', name: 'Tất cả' }, ...dbCats]);
        }
      })
      .catch((e) => console.warn('Lỗi load categories:', e));
  }, []);

  // Tải danh sách phim từ MySQL Backend theo thể loại, từ khóa tìm kiếm và phân trang
  useEffect(() => {
    setIsLoading(true);
    MovieAPI.getMovies({
      page: currentPage,
      limit: PAGE_SIZE,
      search: searchQuery.trim() || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    })
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setMovies(res.data);
          const totalCount = res.pagination?.total || res.data.length;
          setTotalMoviesCount(totalCount);
          setTotalPages(res.pagination?.totalPages || Math.ceil(totalCount / PAGE_SIZE) || 1);
        } else {
          setMovies([]);
          setTotalMoviesCount(0);
          setTotalPages(1);
        }
      })
      .catch((e) => {
        console.warn('Lỗi load explore movies:', e);
        setMovies([]);
        setTotalMoviesCount(0);
        setTotalPages(1);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [searchQuery, selectedCategory, currentPage, PAGE_SIZE]);

  // Reset về trang 1 khi đổi thể loại hoặc từ khóa tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* ----------------- TOP APP BAR ----------------- */}
      <TopAppBar />

      {/* ----------------- MAIN SCROLLABLE CONTENT (FLATLIST) ----------------- */}
      <FlatList
        ref={flatListRef}
        key={`grid-${numColumns}`}
        data={movies}
        keyExtractor={(item) => String(item.id || item.numericId)}
        numColumns={numColumns}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={numColumns > 1 && movies.length > 0 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* ----------------- SEARCH INPUT BAR ----------------- */}
            <View style={styles.searchBarWrapper}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color={CinemaColors.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm theo tên phim..."
                  placeholderTextColor={CinemaColors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color={CinemaColors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* ----------------- CATEGORY FILTER PILLS ----------------- */}
            <View style={styles.categoriesWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContent}
              >
                {categoryPills.map((item) => {
                  const isSelected = selectedCategory === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillSelected,
                      ]}
                      onPress={() => setSelectedCategory(item.id)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ----------------- SECTION HEADER: KẾT QUẢ GỢI Ý ----------------- */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Khám Phá Phim</Text>
                <Text style={styles.resultCountText}>({totalMoviesCount} phim)</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={CinemaColors.primary} />
              <Text style={styles.loadingText}>Đang tải danh sách phim...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={56} color={CinemaColors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>Không tìm thấy phim phù hợp</Text>
              <Text style={styles.emptySubtitle}>
                Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục khác.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.movieCard, { width: cardWidth }]}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/movie/[id]', params: { id: item.id } })}
          >
            {/* Poster Container */}
            <View style={[styles.posterContainer, { width: cardWidth, height: cardHeight }]}>
              <Image source={{ uri: item.image }} style={styles.posterImage} />

              {/* Top-Left: Star Rating Badge */}
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={11} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>

              {/* Top-Right: Quality Badge */}
              <View style={styles.qualityBadge}>
                <Text style={styles.qualityText}>{item.quality}</Text>
              </View>
            </View>

            {/* Title & Metadata */}
            <Text style={styles.movieTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.movieMeta} numberOfLines={1}>
              {item.year}  •  {item.genres}
            </Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.paginationFooterWrapper}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={1}
              />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CinemaColors.background,
  },
  /* Search Bar */
  searchBarWrapper: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  searchInputContainer: {
    height: 46,
    backgroundColor: CinemaColors.surface,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: CinemaColors.textPrimary,
  },

  /* Categories */
  categoriesWrapper: {
    paddingTop: 8,
    marginBottom: 10,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: CinemaColors.surface,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  categoryPillSelected: {
    backgroundColor: CinemaColors.primary,
    borderColor: CinemaColors.primary,
  },
  categoryPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  categoryPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.2,
  },
  resultCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.primary,
  },
  /* Movie Grid */
  gridContainer: {
    paddingBottom: 24,
  },
  columnWrapper: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  paginationFooterWrapper: {
    paddingHorizontal: 20,
  },
  movieCard: {},
  posterContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surface,
    marginBottom: 8,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFD700',
  },
  qualityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  qualityText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  movieTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 3,
  },
  movieMeta: {
    fontSize: 11,
    color: CinemaColors.textSecondary,
    fontWeight: '500',
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: CinemaColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: CinemaColors.textMuted,
    fontWeight: '500',
  },
});
