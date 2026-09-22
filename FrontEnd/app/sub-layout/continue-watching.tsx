import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { CinemaColors } from '@/constants/theme';
import { MovieAPI, UserAPI } from '@/services/API';
import { Pagination } from '@/components/pagination';

interface HistoryItem {
  id: string;
  movieId?: string;
  numericId?: number;
  historyId?: number;
  title: string;
  episode?: string;
  timeWatched?: string;
  progress: number;
  durationLeft?: string;
  image: string;
}

const PAGE_SIZE = 20;

export default function ContinueWatchingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItemForMenu, setSelectedItemForMenu] = useState<HistoryItem | null>(null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tải danh sách lịch sử từ Backend API
  const loadHistory = useCallback(
    async (page: number, search: string) => {
      setIsLoading(true);
      try {
        const res = await MovieAPI.getContinueWatching({
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
        });

        if (res.success && Array.isArray(res.data)) {
          setItems(res.data);
          if (res.pagination) {
            setCurrentPage(res.pagination.page);
            setTotalPages(res.pagination.totalPages || 1);
            setTotalItems(res.pagination.total || res.data.length);
          } else {
            setTotalItems(res.data.length);
            setTotalPages(Math.max(1, Math.ceil(res.data.length / PAGE_SIZE)));
          }
        } else {
          setItems([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (err) {
        setItems([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load ban đầu hoặc khi chuyển trang
  useEffect(() => {
    loadHistory(currentPage, searchQuery);
  }, [currentPage, loadHistory]);

  // Xử lý tìm kiếm với debounce 300ms
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadHistory(1, text);
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    loadHistory(1, '');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home' as any);
    }
  };

  // Xóa toàn bộ lịch sử xem
  const handleClearAll = () => {
    if (items.length === 0 && totalItems === 0) return;
    Alert.alert(
      'Xóa toàn bộ lịch sử',
      'Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem phim không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa Hết',
          style: 'destructive',
          onPress: async () => {
            try {
              await UserAPI.clearAllWatchHistory();
            } catch {}
            setItems([]);
            setTotalItems(0);
            setTotalPages(1);
            setCurrentPage(1);
          },
        },
      ]
    );
  };

  // Xóa 1 phim khỏi lịch sử xem
  const handleDeleteItem = async () => {
    if (!selectedItemForMenu) return;
    const target = selectedItemForMenu;
    setSelectedItemForMenu(null);

    try {
      await UserAPI.deleteWatchHistory(target.historyId || target.id || target.movieId || '');
    } catch {}

    // Cập nhật lại danh sách tại trang hiện tại
    loadHistory(currentPage, searchQuery);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* ----------------- TOP APP BAR ----------------- */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleIconButton}
          onPress={handleSafeBack}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={22} color={CinemaColors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.headerTitle}>Lịch sử xem</Text>
          <Text style={styles.headerSubtitle}>
            {totalItems > 0 ? `${totalItems} phim đã xem` : 'Chưa có phim nào'}
          </Text>
        </View>

        {totalItems > 0 ? (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClearAll}
            activeOpacity={0.75}
          >
            <Text style={styles.clearAllText}>Xóa hết</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {/* ----------------- SEARCH BAR (THANH TÌM KIẾM) ----------------- */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={18} color={CinemaColors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm trong lịch sử xem..."
            placeholderTextColor={CinemaColors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.clearSearchBtn}
            >
              <Ionicons name="close-circle" size={18} color={CinemaColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ----------------- WATCH HISTORY LIST (FLATLIST) ----------------- */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CinemaColors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch sử xem...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={items}
          keyExtractor={(item, index) => String(item.id || item.historyId || index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searchQuery.trim().length > 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="search-outline" size={42} color={CinemaColors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>Không tìm thấy phim phù hợp</Text>
                <Text style={styles.emptySubtitle}>
                  Không có bộ phim nào khớp với từ khóa "{searchQuery}" trong lịch sử xem của bạn.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="time-outline" size={44} color={CinemaColors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Chưa có lịch sử xem phim</Text>
                <Text style={styles.emptySubtitle}>
                  Bạn chưa xem bộ phim nào. Hãy khám phá và thưởng thức kho phim bom tấn đặc sắc ngay hôm nay!
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => router.replace('/(tabs)/explore' as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="film-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.exploreButtonText}>Khám Phá Phim Ngay</Text>
                </TouchableOpacity>
              </View>
            )
          }
          renderItem={({ item }) => {
            const progressPercent = Math.min(100, Math.max(0, Math.round((item.progress || 0) * 100)));

            return (
              <TouchableOpacity
                style={styles.movieRowItem}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/watch/[id]',
                    params: { id: item.movieId || item.id },
                  })
                }
              >
                {/* Left Thumbnail (16:9 Landscape) */}
                <View style={styles.thumbnailWrapper}>
                  <Image source={{ uri: item.image }} style={styles.thumbnailImage} />

                  {/* Episode Badge Bottom-Left */}
                  <View style={styles.episodeBadge}>
                    <Text style={styles.episodeBadgeText}>{item.episode || 'Tập 1'}</Text>
                  </View>

                  {/* Bottom Red Progress Bar */}
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                  </View>
                </View>

                {/* Middle Title & Time Watched */}
                <View style={styles.infoColumn}>
                  <Text style={styles.movieTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={13} color={CinemaColors.textSecondary} />
                    <Text style={styles.timeWatchedText}>
                      {item.timeWatched || item.durationLeft || 'Gần đây'}
                    </Text>
                  </View>
                </View>

                {/* Right 3-Dot Options Menu */}
                <TouchableOpacity
                  style={styles.menuButton}
                  activeOpacity={0.7}
                  onPress={() => setSelectedItemForMenu(item)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color={CinemaColors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.paginationWrapper}>
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
      )}

      {/* ----------------- BOTTOM SHEET OPTIONS MODAL ----------------- */}
      <Modal
        visible={!!selectedItemForMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItemForMenu(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedItemForMenu(null)}
        >
          <View style={styles.bottomSheetCard}>
            {/* Top Drag Handle Bar */}
            <View style={styles.dragHandle} />

            {/* Xóa Option Row */}
            <TouchableOpacity
              style={styles.deleteActionRow}
              activeOpacity={0.7}
              onPress={handleDeleteItem}
            >
              <Ionicons name="trash-outline" size={22} color={CinemaColors.primary} style={styles.deleteIcon} />
              <Text style={[styles.deleteActionText, { color: CinemaColors.primary }]}>
                Xóa khỏi lịch sử xem
              </Text>
            </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: CinemaColors.background,
  },
  topBarCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: CinemaColors.textSecondary,
    marginTop: 2,
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
  clearAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 51, 75, 0.12)',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: CinemaColors.primary,
  },

  /* Search Bar */
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CinemaColors.background,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: CinemaColors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: CinemaColors.textPrimary,
    fontSize: 13.5,
  },
  clearSearchBtn: {
    padding: 4,
  },

  /* Loading State */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 13,
    color: CinemaColors.textSecondary,
    marginTop: 12,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 36,
  },

  /* Row Item */
  movieRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
    backgroundColor: CinemaColors.surface,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  thumbnailWrapper: {
    width: 130,
    height: 74,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surfaceElevated,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  episodeBadge: {
    position: 'absolute',
    bottom: 5,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  episodeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: CinemaColors.primary,
  },

  /* Title & Time Watched */
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    lineHeight: 19,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeWatchedText: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    fontWeight: '500',
  },

  /* 3-Dot Menu Button */
  menuButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Pagination Wrapper */
  paginationWrapper: {
    marginTop: 18,
    marginBottom: 20,
    alignItems: 'center',
  },

  /* Bottom Sheet Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#181A24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  deleteActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  deleteIcon: {
    marginRight: 2,
  },
  deleteActionText: {
    fontSize: 15,
    fontWeight: '600',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  emptyIconBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 75, 0.25)',
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
    marginBottom: 20,
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
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
