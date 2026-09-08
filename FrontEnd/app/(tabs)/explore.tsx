import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  useWindowDimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';
import { BrandLogo } from '@/components/brand-logo';

// -------------------------------------------------------------
// DỮ LIỆU THỂ LOẠI
// -------------------------------------------------------------
const CATEGORY_PILLS = [
  { id: 'all', name: 'Tất cả' },
  { id: 'action', name: 'Hành động' },
  { id: 'scifi', name: 'Khoa học viễn tưởng' },
  { id: 'drama', name: 'Kịch tính' },
  { id: 'martial', name: 'Võ thuật' },
  { id: 'crime', name: 'Hình sự' },
  { id: 'racing', name: 'Đua xe' },
  { id: 'horror', name: 'Kinh dị' },
];

// -------------------------------------------------------------
// DỮ LIỆU PHIM KHÁM PHÁ & TÌM KIẾM
// -------------------------------------------------------------
const EXPLORE_MOVIES = [
  {
    id: 'exp-1',
    title: 'Vùng Tối Vô Cực',
    rating: '8.9',
    quality: '4K',
    year: '2024',
    category: 'scifi',
    genres: 'Hành Động, Sci-Fi',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'exp-2',
    title: 'Mật Lệnh Bóng Đêm',
    rating: '8.7',
    quality: '4K',
    year: '2023',
    category: 'action',
    genres: 'Hành Động, Kịch Tính',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'exp-3',
    title: 'Tàn Tích Hư Vô',
    rating: '9.3',
    quality: '4K UHD',
    year: '2024',
    category: 'scifi',
    genres: 'Hành Động, Viễn Tưởng',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'exp-4',
    title: 'Lưỡi Đao Lửa Tím',
    rating: '8.6',
    quality: '4K',
    year: '2023',
    category: 'martial',
    genres: 'Võ Thuật, Giả Tưởng',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'exp-5',
    title: 'Băng Tốc Nghìn Dặm',
    rating: '8.8',
    quality: '4K',
    year: '2024',
    category: 'racing',
    genres: 'Đua Xe, Hành Động',
    image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'exp-6',
    title: 'Phi Vụ Thế Kỷ 3',
    rating: '8.5',
    quality: '4K',
    year: '2022',
    category: 'crime',
    genres: 'Hình Sự, Hành Động',
    image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'exp-7',
    title: 'Dune: Hành Tinh Cát 2',
    rating: '9.1',
    quality: '4K UHD',
    year: '2024',
    category: 'scifi',
    genres: 'Khoa Học Viễn Tưởng',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'exp-8',
    title: 'Deadpool & Wolverine',
    rating: '8.9',
    quality: '4K',
    year: '2024',
    category: 'action',
    genres: 'Hành Động, Hài Hước',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
  },
];

const SORT_OPTIONS = [
  { id: 'latest', label: 'MỚI NHẤT' },
  { id: 'rating', label: 'ĐÁNH GIÁ CAO' },
  { id: 'popular', label: 'PHỔ BIẾN' },
];

export default function ExploreScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numColumns = isTablet ? 4 : 2;
  const GAP = 14;
  const HORIZONTAL_PADDING = 20 * 2;
  const cardWidth = (width - HORIZONTAL_PADDING - (numColumns - 1) * GAP) / numColumns;
  const cardHeight = cardWidth * 1.45;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [showSortModal, setShowSortModal] = useState(false);

  // Filter & Search Logic
  const filteredMovies = useMemo(() => {
    let result = EXPLORE_MOVIES.filter((movie) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genres.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' || movie.category === selectedCategory;

      return matchSearch && matchCategory;
    });

    if (selectedSort === 'rating') {
      result = [...result].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (selectedSort === 'latest') {
      result = [...result].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    }

    return result;
  }, [searchQuery, selectedCategory, selectedSort]);

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === selectedSort)?.label || 'MỚI NHẤT';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* ----------------- TOP APP BAR ----------------- */}
      <View style={styles.appBar}>
        <BrandLogo layout="horizontal" size="small" showTagline={false} />

        <TouchableOpacity style={styles.avatarButton} activeOpacity={0.8}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            }}
            style={styles.avatarImage}
          />
        </TouchableOpacity>
      </View>

      {/* ----------------- SEARCH INPUT BAR ----------------- */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={CinemaColors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm phim, diễn viên, đạo diễn..."
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

        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.75}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="options-outline" size={20} color={CinemaColors.textPrimary} />
          <View style={styles.filterDot} />
        </TouchableOpacity>
      </View>

      {/* ----------------- CATEGORY FILTER PILLS ----------------- */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={CATEGORY_PILLS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
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
          }}
        />
      </View>

      {/* ----------------- SECTION HEADER: KẾT QUẢ GỢI Ý ----------------- */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Kết quả gợi ý</Text>
          <Text style={styles.resultCountText}>({filteredMovies.length} phim)</Text>
        </View>

        <TouchableOpacity
          style={styles.sortDropdownButton}
          onPress={() => setShowSortModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.sortDropdownText}>{currentSortLabel}</Text>
          <Ionicons name="chevron-down" size={14} color={CinemaColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ----------------- MOVIE GRID RESULTS (RESPONSIVE) ----------------- */}
      {filteredMovies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={56} color={CinemaColors.textMuted} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Không tìm thấy phim phù hợp</Text>
          <Text style={styles.emptySubtitle}>
            Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc thể loại.
          </Text>
        </View>
      ) : (
        <FlatList
          key={`grid-${numColumns}`}
          data={filteredMovies}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.movieCard, { width: cardWidth }]} activeOpacity={0.85}>
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
        />
      )}

      {/* ----------------- SORT MODAL ----------------- */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sắp Xếp Theo</Text>
            {SORT_OPTIONS.map((option) => {
              const isChosen = selectedSort === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.modalOption, isChosen && styles.modalOptionChosen]}
                  onPress={() => {
                    setSelectedSort(option.id);
                    setShowSortModal(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.modalOptionText, isChosen && styles.modalOptionTextChosen]}>
                    {option.label}
                  </Text>
                  {isChosen && <Ionicons name="checkmark" size={18} color={CinemaColors.primary} />}
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
    backgroundColor: CinemaColors.background,
  },
  /* Top App Bar */
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: CinemaColors.primary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  /* Search Bar */
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    height: 48,
    backgroundColor: CinemaColors.surface,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: CinemaColors.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: CinemaColors.primary,
  },

  /* Categories */
  categoriesWrapper: {
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
  sortDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortDropdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: CinemaColors.textSecondary,
    letterSpacing: 0.5,
  },

  /* Movie Grid */
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 18,
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

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    width: '100%',
    backgroundColor: CinemaColors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalOptionChosen: {},
  modalOptionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  modalOptionTextChosen: {
    color: CinemaColors.primary,
    fontWeight: '700',
  },
});
