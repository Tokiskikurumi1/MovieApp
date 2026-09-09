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
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { CinemaColors } from '@/constants/theme';

// -------------------------------------------------------------
// DỮ LIỆU PHIM MỚI RA MẮT (NEW RELEASES MOCK DATA)
// -------------------------------------------------------------
const NEW_RELEASES_DATA = [
  {
    id: 'nr-1',
    title: 'The Daily Life of the Immortal King 5',
    rating: '9.3',
    year: '2024',
    quality: '4K Ultra HD',
    tags: ['Tiểu Thuyết Chuyển Thể', 'Giả Tưởng', 'Vườn Trường'],
    synopsis: 'Vương Lệnh che giấu sức mạnh vô song của mình tại học viện tu chân, nhưng những rắc rối và thế lực hắc ám liên tục kéo đến quấy rầy cuộc sống bình yên của anh.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'nr-2',
    title: 'To Be Hero X: Anh Hùng Thức Tỉnh',
    rating: '8.9',
    year: '2024',
    quality: '4K HDR',
    tags: ['Nhiệt Huyết', 'Giả Tưởng', 'Hành Động'],
    synopsis: 'Trong thế giới nơi niềm tin của mọi người tạo nên sức mạnh cho các vị anh hùng, giải đấu Hero Tournament bắt đầu với sự xuất hiện của chiến binh bí ẩn Rank X.',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'nr-3',
    title: 'Immortality 3: Vĩnh Sinh Tam Thế',
    rating: '9.0',
    year: '2024',
    quality: '4K IMAX',
    tags: ['Tiểu Thuyết', 'Tu Chân', 'Hành Động'],
    synopsis: 'Phương Hàn bằng sức một mình bước chân vào cảnh giới tiên ma vô tận, từng bước lột xác trở thành cường giả chí tôn nắm giữ vận mệnh vạn giới.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'nr-4',
    title: 'Tiên Đế Trở Lại: Vấn Đỉnh Cửu Thiên',
    rating: '8.8',
    year: '2024',
    quality: 'Dolby Vision',
    tags: ['Cổ Trang', 'Huyền Huyễn', 'Chuyển Sinh'],
    synopsis: 'Vân Thanh Nhan từng bị phản bội và rơi vào tuyệt lộ, sau 3000 năm tu luyện tại Tiên Giới đã thành công xé rách hư không quay trở về trả thù và bảo vệ những người thân yêu.',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'nr-5',
    title: 'Nông Dân Nhàn Nhã Ở Dị Giới 2',
    rating: '8.7',
    year: '2024',
    quality: 'Full HD',
    tags: ['Hậu Cung', 'Chuyển Sinh', 'Dị Giới'],
    synopsis: 'Chàng trai trẻ được thần linh ban cho nông cụ vạn năng và thể chất bất hoại, bắt đầu xây dựng nên ngôi làng trù phú và hạnh phúc giữa lòng rừng rậm tử thần.',
    image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'nr-6',
    title: 'Mật Vụ Bóng Đêm 2: Tận Cùng Hỗn Loạn',
    rating: '9.1',
    year: '2024',
    quality: '4K HDR',
    tags: ['Hành Động', 'Hình Sự', 'Bắn Súng'],
    synopsis: 'Một đội đặc nhiệm ngầm phải thâm nhập vào sào huyệt của tổ chức buôn vũ khí công nghệ cao xuyên quốc gia để ngăn chặn vụ tấn công mạng toàn cầu.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'nr-7',
    title: 'Thiên Hà Vô Tận: Chuyến Tàu Cuối',
    rating: '8.9',
    year: '2024',
    quality: '4K UHD',
    tags: ['Viễn Tưởng', 'Không Gian', 'Sinh Tồn'],
    synopsis: 'Con tàu di cư cuối cùng của nhân loại trôi dạt vào vùng nhiễu loạn thời gian, buộc phi hành đoàn phải giải mã các tín hiệu từ tương lai để sống sót.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'nr-8',
    title: 'Ngôi Nhà Hắc Ám: Lời Nguyền Trở Lại',
    rating: '8.6',
    year: '2024',
    quality: '4K HDR',
    tags: ['Kinh Dị', 'Bí Ẩn', 'Siêu Nhiên'],
    synopsis: 'Một nhóm bạn trẻ tìm đến ngôi biệt thự bỏ hoang trên đỉnh đồi tuyết để tìm kiếm tư liệu cho kênh livestream, vô tình đánh thức thực thể ma quỷ tàn ác.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
  },
];

// -------------------------------------------------------------
// DỮ LIỆU GỢI Ý PHIM HAY (RECOMMENDED MOVIES MOCK DATA)
// -------------------------------------------------------------
const RECOMMENDED_DATA = [
  {
    id: 'rec-1',
    title: 'Avatar: Dòng Chảy Của Nước',
    rating: '9.2',
    year: '2024',
    quality: '4K IMAX',
    tags: ['Khoa Học Viễn Tưởng', 'Phiêu Lưu', 'Bom Tấn'],
    synopsis: 'Trở lại thế giới diệu kỳ Pandora khi gia đình Sully đối mặt với hiểm nguy mới từ người Trái Đất và phải liên minh với tộc người biển Metkayina.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-2',
    title: 'Interstellar: Hố Đen Tử Thần',
    rating: '9.4',
    year: '2024',
    quality: '4K HDR',
    tags: ['Viễn Tưởng', 'Vũ Trụ', 'Sâu Sắc'],
    synopsis: 'Một đoàn thám hiểm không gian du hành xuyên qua lỗ sâu gần sao Thổ để tìm kiếm hành tinh mới có thể duy trì sự sống cho toàn thể nhân loại.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-3',
    title: 'Deadpool & Wolverine: Chiến Tranh Đa Vũ Trụ',
    rating: '9.0',
    year: '2024',
    quality: 'Dolby Vision',
    tags: ['Hành Động', 'Hài Hước', 'Marvel'],
    synopsis: 'Cặp đôi bất đắc dĩ quậy tung dòng thời gian trong cuộc chiến giải cứu thế giới trước sự sụp đổ của các nhánh vũ trụ song song.',
    image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-4',
    title: 'Dune: Hành Tinh Cát 2',
    rating: '9.1',
    year: '2024',
    quality: '4K IMAX',
    tags: ['Sci-Fi', 'Hành Động', 'Sử Thi'],
    synopsis: 'Hành trình trỗi dậy của Paul Muad\'Dib Atreides khi anh lãnh đạo cuộc khởi nghĩa giải phóng hành tinh Arrakis khỏi ách thống trị tàn bạo.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-5',
    title: 'John Wick: Sát Thủ Bất Tử',
    rating: '8.8',
    year: '2023',
    quality: '4K UHD',
    tags: ['Hành Động', 'Võ Thuật', 'Kịch Tính'],
    synopsis: 'Những màn đấu súng và cận chiến đỉnh cao khắp New York, Osaka, Berlin và Paris khi John Wick quyết tâm giành lại sự tự do cho bản thân.',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-6',
    title: 'Cyberpunk: Đêm Định Mệnh',
    rating: '9.2',
    year: '2024',
    quality: 'Full HD',
    tags: ['Anime', 'Cyberpunk', 'Hành Động'],
    synopsis: 'Câu chuyện bi tráng về ước mơ, tình bạn và tình yêu của David Martinez trong thành phố ngập tràn công nghệ cấy ghép và bạo lực ngầm.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-7',
    title: 'Oppenheimer: Kỷ Nguyên Nguyên Tử',
    rating: '9.3',
    year: '2023',
    quality: '4K IMAX',
    tags: ['Lịch Sử', 'Tâm Lý', 'Giải Thưởng'],
    synopsis: 'Tác phẩm đoạt nhiều giải Oscar tái hiện cuộc đời và những trăn trở đạo đức sâu sắc của nhà khoa học đứng đầu dự án chế tạo vũ khí hủy diệt.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'rec-8',
    title: 'Stranger Things: Thế Giới Ngược',
    rating: '8.9',
    year: '2024',
    quality: 'Dolby Vision',
    tags: ['Kinh Dị', 'Bí Ẩn', 'Thập Niên 80'],
    synopsis: 'Những hiện tượng kỳ bí và quái vật từ không gian song song đe dọa nuốt chửng thị trấn nhỏ, nơi tình bạn chân thành là vũ khí duy nhất.',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
  },
];

export default function MovieCollectionScreen() {
  const router = useRouter();
  const { type = 'recommended', title } = useLocalSearchParams<{
    type?: string;
    title?: string;
  }>();

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const isNewReleases = type === 'new-releases';
  const displayTitle = title || (isNewReleases ? 'Phim Mới Ra Mắt' : 'Gợi Ý Phim Hay');
  const moviesData = isNewReleases ? NEW_RELEASES_DATA : RECOMMENDED_DATA;

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Khám phá danh sách ${displayTitle} trên CineStream!`,
        title: displayTitle,
      });
    } catch {
      // ignore
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayTitle}
          </Text>
          <Text style={styles.headerSubtitle}>
            Tổng cộng {moviesData.length} bộ phim
          </Text>
        </View>

        <TouchableOpacity
          style={styles.circleIconButton}
          onPress={handleShare}
          activeOpacity={0.75}
        >
          <Ionicons name="share-social-outline" size={20} color={CinemaColors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ----------------- MOVIE LIST (FLATLIST) ----------------- */}
      <FlatList
        data={moviesData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSaved = bookmarkedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={styles.movieItemCard}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/movie/[id]', params: { id: item.id } })}
            >
              {/* Left Column: Poster Image */}
              <View style={styles.posterWrapper}>
                <Image source={{ uri: item.image }} style={styles.posterImage} />

                {/* Rating Badge Bottom-Right */}
                <View style={styles.posterRatingBadge}>
                  <Ionicons name="star" size={10} color="#FFD700" />
                  <Text style={styles.posterRatingText}>{item.rating}</Text>
                </View>
              </View>

              {/* Right Column: Title, Tag Pills, Synopsis & Action */}
              <View style={styles.movieInfoColumn}>
                {/* Title */}
                <Text style={styles.movieTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                {/* Tag Pills Row */}
                <View style={styles.tagPillsRow}>
                  {item.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tagPill}>
                      <Text style={styles.tagPillText}>{tag}</Text>
                    </View>
                  ))}
                  <View style={styles.qualityTagPill}>
                    <Text style={styles.qualityTagText}>{item.quality}</Text>
                  </View>
                </View>

                {/* Short Synopsis Description */}
                <Text style={styles.synopsisText} numberOfLines={2}>
                  {item.synopsis}
                </Text>

                {/* Bottom Row Action */}
                <View style={styles.bottomRow}>
                  <View style={styles.metaRow}>
                    <Text style={styles.yearText}>{item.year}</Text>
                    <Text style={styles.dotSeparator}>•</Text>
                    <View style={styles.audioRow}>
                      <Ionicons name="sparkles" size={12} color={CinemaColors.primary} />
                      <Text style={styles.qualitySubText}>HD/4K</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.bookmarkButton, isSaved && styles.bookmarkButtonActive]}
                    activeOpacity={0.75}
                    onPress={() => toggleBookmark(item.id)}
                  >
                    <Ionicons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      color={isSaved ? CinemaColors.primary : CinemaColors.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
    paddingTop: 16,
    paddingBottom: 36,
  },

  /* Movie Card */
  movieItemCard: {
    flexDirection: 'row',
    backgroundColor: CinemaColors.surface,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    gap: 12,
  },
  posterWrapper: {
    width: 95,
    height: 135,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: CinemaColors.surfaceElevated,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  posterRatingBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  posterRatingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
  },

  /* Movie Info Column */
  movieInfoColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginBottom: 4,
  },
  tagPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 6,
  },
  tagPill: {
    backgroundColor: CinemaColors.surfaceElevated,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: CinemaColors.border,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  qualityTagPill: {
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 51, 75, 0.25)',
  },
  qualityTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: CinemaColors.primary,
  },
  synopsisText: {
    fontSize: 11.5,
    color: CinemaColors.textSecondary,
    lineHeight: 16.5,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  yearText: {
    fontSize: 11.5,
    color: CinemaColors.textSecondary,
    fontWeight: '500',
  },
  dotSeparator: {
    fontSize: 11,
    color: CinemaColors.textMuted,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  qualitySubText: {
    fontSize: 11,
    color: CinemaColors.textSecondary,
    fontWeight: '600',
  },
  bookmarkButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: CinemaColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  bookmarkButtonActive: {
    backgroundColor: 'rgba(255, 51, 75, 0.15)',
    borderColor: CinemaColors.primary,
  },
});
