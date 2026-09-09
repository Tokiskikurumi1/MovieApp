import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { CinemaColors } from '@/constants/theme';

// -------------------------------------------------------------
// DỮ LIỆU MOCK PHIM TIẾP TỤC XEM (CONTINUE WATCHING DATA)
// -------------------------------------------------------------
const INITIAL_CONTINUE_WATCHING = [
  {
    id: 'cw-1',
    movieId: 'tr-3',
    title: 'Nông Dân Nhàn Nhã Ở Dị Giới - Mùa 2',
    episode: 'Tập 1',
    timeWatched: '14:03',
    progress: 0.68,
    image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'cw-2',
    movieId: 'tr-8',
    title: 'The Daily Life of the Immortal King 5',
    episode: 'Tập 1',
    timeWatched: '13:45',
    progress: 0.75,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'cw-3',
    movieId: 'tr-7',
    title: 'Dune: Hành Tinh Cát - Phần 2',
    episode: 'Bản Rạp',
    timeWatched: '1h 52m',
    progress: 0.68,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'cw-4',
    movieId: 'tr-1',
    title: 'Oppenheimer: Cha Đẻ Bom Nguyên Tử',
    episode: 'Full HD',
    timeWatched: '1h 03m',
    progress: 0.35,
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'cw-5',
    movieId: 'tr-2',
    title: '[ Phần 1 ] Được Nữ Đế Sủng Ái Ta Nên Làm Gì',
    episode: 'PHẦN 1',
    timeWatched: '27:56',
    progress: 0.85,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'cw-6',
    movieId: 'tr-5',
    title: 'Kaguya-sama: Cuộc Chiến Tỏ Tình Siêu Căng Não',
    episode: 'Tập 12',
    timeWatched: '13/08/2024',
    progress: 0.9,
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop',
  },
];

type ContinueItem = (typeof INITIAL_CONTINUE_WATCHING)[0];

export default function ContinueWatchingScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ContinueItem[]>(INITIAL_CONTINUE_WATCHING);
  const [selectedItemForMenu, setSelectedItemForMenu] = useState<ContinueItem | null>(null);

  const clearAll = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Xóa toàn bộ',
      'Bạn có muốn xóa toàn bộ lịch sử đang xem không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa Hết',
          style: 'destructive',
          onPress: () => setItems([]),
        },
      ]
    );
  };

  const handleDeleteItem = () => {
    if (selectedItemForMenu) {
      setItems((prev) => prev.filter((item) => item.id !== selectedItemForMenu.id));
      setSelectedItemForMenu(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={CinemaColors.background} />

      {/* ----------------- TOP APP BAR ----------------- */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleIconButton}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={22} color={CinemaColors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.headerTitle}>Tiếp Tục Xem</Text>
          <Text style={styles.headerSubtitle}>
            {items.length} phim đang xem dở
          </Text>
        </View>
      </View>

      {/* ----------------- CONTINUE WATCHING LIST (FLATLIST) ----------------- */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="play-skip-forward-outline" size={44} color={CinemaColors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có phim đang xem dở</Text>
            <Text style={styles.emptySubtitle}>
              Khi bạn xem phim nhưng chưa kết thúc, phim sẽ tự động lưu tiến độ vào đây để bạn dễ dàng xem tiếp.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.replace('/(tabs)' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="film-outline" size={18} color="#FFFFFF" />
              <Text style={styles.exploreButtonText}>Khám Phá Phim Ngay</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const progressPercent = Math.round(item.progress * 100);

          return (
            <TouchableOpacity
              style={styles.movieRowItem}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/movie/[id]',
                  params: { id: item.movieId || item.id },
                })
              }
            >
              {/* Left Thumbnail (16:9 Landscape) */}
              <View style={styles.thumbnailWrapper}>
                <Image source={{ uri: item.image }} style={styles.thumbnailImage} />

                {/* Episode Badge Bottom-Left */}
                <View style={styles.episodeBadge}>
                  <Text style={styles.episodeBadgeText}>{item.episode}</Text>
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
                <Text style={styles.timeWatchedText}>{item.timeWatched}</Text>
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
      />

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

            {/* Xóa Option Row matching screenshot */}
            <TouchableOpacity
              style={styles.deleteActionRow}
              activeOpacity={0.7}
              onPress={handleDeleteItem}
            >
              <Ionicons name="trash-outline" size={22} color={CinemaColors.textPrimary} style={styles.deleteIcon} />
              <Text style={styles.deleteActionText}>Xóa</Text>
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },

  /* Row Item matching screenshot */
  movieRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  thumbnailWrapper: {
    width: 145,
    height: 82,
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
    fontSize: 11,
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
    fontSize: 15,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  timeWatchedText: {
    fontSize: 13,
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
    fontSize: 16,
    fontWeight: '600',
    color: CinemaColors.textPrimary,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 75, 0.25)',
  },
  emptyTitle: {
    fontSize: 17,
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
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
