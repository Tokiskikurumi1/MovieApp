import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { CinemaColors } from '@/constants/theme';
import { BrandLogo } from '@/components/brand-logo';
import { Pagination } from '@/components/pagination';
import { TopAppBar } from '@/components/top-app-bar';
import { UserAPI } from '@/services/API';

import { useFavorites } from '@/store/favorite-context';

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

  const { favorites, isLoading, removeFavorite, refreshFavorites } = useFavorites();
  const [selectedTab, setSelectedTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Tự động đồng bộ danh sách phim yêu thích mỗi khi vào lại màn hình
  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
    }, [refreshFavorites])
  );

  // Reset current page when tab or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchQuery]);

  const filteredFavorites = useMemo(() => {
    let list = favorites;
    if (selectedTab !== 'all') {
      list = list.filter((item) => item.type === selectedTab);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.genres?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [favorites, selectedTab, searchQuery]);

  const totalPages = Math.ceil(filteredFavorites.length / PAGE_SIZE);

  const paginatedFavorites = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredFavorites.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredFavorites, currentPage, PAGE_SIZE]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleCloseSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* ----------------- TOP APP BAR ----------------- */}
      <TopAppBar />

      {/* ----------------- SCROLLABLE FAVORITES GRID (FLATLIST) ----------------- */}
      <FlatList
        ref={flatListRef}
        key={`grid-${numColumns}`}
        data={paginatedFavorites}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={numColumns > 1 && paginatedFavorites.length > 0 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header / Inline Search Header */}
            {isSearching ? (
              <View style={styles.searchHeaderWrapper}>
                <View style={styles.searchInputContainer}>
                  <Ionicons
                    name="search"
                    size={18}
                    color={CinemaColors.textMuted}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm trong phim yêu thích..."
                    placeholderTextColor={CinemaColors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={18} color={CinemaColors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.cancelSearchButton}
                  onPress={handleCloseSearch}
                  activeOpacity={0.75}
                >
                  <Text style={styles.cancelSearchText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Phim Yêu Thích</Text>
                  <Text style={styles.headerSubtitle}>
                    {filteredFavorites.length} bộ phim đã lưu
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.searchButton}
                  activeOpacity={0.75}
                  onPress={() => setIsSearching(true)}
                >
                  <Ionicons name="search" size={20} color={CinemaColors.textPrimary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Filter Tabs */}
            <View style={styles.filterTabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterTabsContent}
              >
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
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={CinemaColors.primary} />
              <Text style={styles.loadingText}>Đang tải phim yêu thích...</Text>
            </View>
          ) : searchQuery.trim() !== '' ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={44} color={CinemaColors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Không tìm thấy phim</Text>
              <Text style={styles.emptySubtitle}>
                Không có phim yêu thích nào khớp với "{searchQuery}".
              </Text>
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh-outline" size={16} color={CinemaColors.textPrimary} />
                <Text style={styles.clearSearchButtonText}>Xóa Tìm Kiếm</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="heart-dislike-outline" size={48} color={CinemaColors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có phim yêu thích</Text>
              <Text style={styles.emptySubtitle}>
                Hãy khám phá kho phim và bấm nút "Yêu thích" để lưu lại những bộ phim bạn yêu thích.
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
          )
        }
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
  searchHeaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    height: 42,
    backgroundColor: CinemaColors.surface,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: CinemaColors.textPrimary,
  },
  cancelSearchButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  cancelSearchText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: CinemaColors.primary,
  },
  clearSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CinemaColors.surface,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  clearSearchButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.textPrimary,
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
    paddingVertical: 12,
  },
  filterTabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    fontSize: 12.5,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gridContainer: {
    paddingBottom: 24,
  },
  columnWrapper: {
    paddingHorizontal: 20,
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
  paginationFooterWrapper: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    paddingVertical: 80,
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
