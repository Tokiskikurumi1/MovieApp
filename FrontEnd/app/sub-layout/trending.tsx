import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  useWindowDimensions,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { CinemaColors } from '@/constants/theme';

// -------------------------------------------------------------
// DỮ LIỆU DANH MỤC LỌC BẢNG XẾP HẠNG
// -------------------------------------------------------------
const RANKING_CATEGORIES = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'action', label: 'Hành Động' },
  { id: 'scifi', label: 'Viễn Tưởng' },
  { id: 'anime', label: 'Anime' },
  { id: 'drama', label: 'Kịch Tính' },
  { id: 'horror', label: 'Kinh Dị' },
  { id: 'fantasy', label: 'Cổ Trang' },
  { id: 'comedy', label: 'Hài Hước' },
];

// -------------------------------------------------------------
// DỮ LIỆU TOP 20 PHIM THỊNH HÀNH (TOP 20 TRENDING MOVIES)
// -------------------------------------------------------------
const TOP_20_MOVIES = [
  {
    id: 'tr-1',
    rank: 1,
    title: 'Interstellar: Hố Đen Tử Thần',
    rating: '9.4',
    year: '2024',
    category: 'scifi',
    tags: ['Viễn Tưởng', 'Vũ Trụ', '4K IMAX'],
    synopsis: 'Khi Trái Đất dần cạn kiệt sự sống, một nhóm nhà thám hiểm dũng cảm tiến hành chuyến du hành xuyên qua lỗ sâu không gian để tìm kiếm ngôi nhà mới cho nhân loại.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-2',
    rank: 2,
    title: 'Deadpool & Wolverine: Đa Vũ Trụ',
    rating: '9.1',
    year: '2024',
    category: 'action',
    tags: ['Hành Động', 'Hài Hước', '4K HDR'],
    synopsis: 'Cặp bài trùng bất đắc dĩ của vũ trụ Marvel cùng hợp lực chống lại hiểm họa diệt vong, mang đến những pha hành động mãn nhãn và vô vàn tiếng cười bùng nổ.',
    image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-3',
    rank: 3,
    title: 'Dune: Hành Tinh Cát 2',
    rating: '9.0',
    year: '2024',
    category: 'scifi',
    tags: ['Sci-Fi', 'Sử Thi', 'Dolby Vision'],
    synopsis: 'Paul Atreides liên minh cùng Chani và tộc Fremen bí ẩn trong cuộc trả thù những kẻ đã tàn sát gia tộc anh, đồng thời đối mặt với số phận nghiệt ngã của vũ trụ.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-4',
    rank: 4,
    title: 'Avatar: Dòng Chảy Của Nước',
    rating: '8.9',
    year: '2024',
    category: 'scifi',
    tags: ['Viễn Tưởng', 'Phiêu Lưu', '4K UHD'],
    synopsis: 'Jake Sully và Neytiri cùng gia đình rời bỏ khu rừng quê hương để tìm kiếm nơi ẩn náu bên các rạn san hô đại dương huyền bí của hành tinh Pandora.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-5',
    rank: 5,
    title: 'Cyberpunk: Edgerunners - Màn Đêm',
    rating: '9.0',
    year: '2024',
    category: 'anime',
    tags: ['Anime', 'Hành Động', 'Cyberpunk'],
    synopsis: 'Tại thành phố Night City rực rỡ nhưng tàn khốc, một chàng trai đường phố tài năng chấp nhận đánh cược sinh mạng để trở thành lính đánh thuê công nghệ cao Edgerunner.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-6',
    rank: 6,
    title: 'John Wick: Chapter 4 - Sát Thủ',
    rating: '8.8',
    year: '2023',
    category: 'action',
    tags: ['Hành Động', 'Hình Sự', '4K HDR'],
    synopsis: 'John Wick phát hiện ra con đường để đánh bại Hội Đồng Tối Cao. Nhưng trước khi giành lại tự do, anh phải đối đầu với một liên minh sát thủ hùng mạnh toàn cầu.',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-7',
    rank: 7,
    title: 'Spider-Man: Across the Spider-Verse',
    rating: '9.1',
    year: '2023',
    category: 'anime',
    tags: ['Hoạt Hình', 'Siêu Anh Hùng', '4K IMAX'],
    synopsis: 'Miles Morales bị cuốn vào đa vũ trụ và chạm trán biệt đội Người Nhện ưu tú. Khi các anh hùng bất đồng quan điểm, Miles phải tự mình định nghĩa lại ý nghĩa người hùng.',
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-8',
    rank: 8,
    title: 'Oppenheimer: Cha Đẻ Bom Nguyên Tử',
    rating: '9.2',
    year: '2023',
    category: 'drama',
    tags: ['Lịch Sử', 'Kịch Tính', '4K IMAX'],
    synopsis: 'Câu chuyện ly kỳ và sâu sắc về nhà vật lý lý thuyết J. Robert Oppenheimer, người đứng đầu dự án Manhattan lịch sử mở ra kỷ nguyên hạt nhân của nhân loại.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-9',
    rank: 9,
    title: 'Stranger Things 5: Hồi Kết',
    rating: '8.9',
    year: '2024',
    category: 'horror',
    tags: ['Kinh Dị', 'Bí Ẩn', 'Dolby Vision'],
    synopsis: 'Thị trấn Hawkins đứng trước ranh giới sụp đổ hoàn toàn khi thế giới Upside Down xâm lấn thế giới thực. Eleven cùng nhóm bạn bước vào cuộc chiến sinh tử cuối cùng.',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-10',
    rank: 10,
    title: 'House of the Dragon: Gia Tộc Rồng 2',
    rating: '8.8',
    year: '2024',
    category: 'fantasy',
    tags: ['Cổ Trang', 'Kịch Tính', '4K HDR'],
    synopsis: 'Cuộc nội chiến đẫm máu Vũ Điệu Của Bầy Rồng chính thức bùng nổ giữa phe Đen và phe Xanh để tranh giành Ngai Sắt tối cao của Bảy Vương Quốc.',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-11',
    rank: 11,
    title: 'The Batman: Hiệp Sĩ Bóng Đêm',
    rating: '8.6',
    year: '2023',
    category: 'action',
    tags: ['Trinh Thám', 'Hành Động', '4K HDR'],
    synopsis: 'Khi kẻ giết người hàng loạt The Riddler bắt đầu nhắm vào giới tinh hoa Gotham, Batman dấn thân vào cuộc điều tra thế giới ngầm tăm tối bậc nhất thành phố.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-12',
    rank: 12,
    title: 'The Last of Us: Sinh Tồn',
    rating: '9.0',
    year: '2023',
    category: 'horror',
    tags: ['Sinh Tồn', 'Hành Động', '4K UHD'],
    synopsis: 'Sau đại dịch nấm biến đổi hủy diệt nền văn minh, Joel được giao nhiệm vụ hộ tống cô bé Ellie băng qua nước Mỹ hoang tàn và đầy rẫy hiểm họa rình rập.',
    image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-13',
    rank: 13,
    title: 'Loki: Vị Thần Thời Gian 2',
    rating: '8.8',
    year: '2023',
    category: 'scifi',
    tags: ['Khoa Học', 'Siêu Anh Hùng', '4K HDR'],
    synopsis: 'Loki phiêu lưu qua các dòng thời gian không ngừng mở rộng của đa vũ trụ, tìm cách bảo vệ cơ quan TVA và khám phá bản chất thật sự của quyền năng thời gian.',
    image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-14',
    rank: 14,
    title: 'Top Gun: Maverick - Phi Công Siêu Đẳng',
    rating: '8.9',
    year: '2023',
    category: 'action',
    tags: ['Hành Động', 'Đua Bay', '4K IMAX'],
    synopsis: 'Sau hơn 30 năm cống hiến, phi công huyền thoại Pete Maverick Mitchell nhận nhiệm vụ huấn luyện một phi đội trẻ cho chiến dịch không kích cảm tử chưa từng có.',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-15',
    rank: 15,
    title: 'Blade Runner 2049: Tàn Tích Tương Lai',
    rating: '8.9',
    year: '2023',
    category: 'scifi',
    tags: ['Sci-Fi', 'Trinh Thám', '4K HDR'],
    synopsis: 'Sĩ quan cảnh sát K của LAPD khai quật một bí mật chôn giấu từ lâu có nguy cơ đẩy phần còn lại của xã hội vào hỗn loạn, dẫn anh đến việc tìm kiếm Rick Deckard.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-16',
    rank: 16,
    title: 'Vùng Đất Câm Lặng: Ngày Đầu Tiên',
    rating: '8.6',
    year: '2024',
    category: 'horror',
    tags: ['Kinh Dị', 'Giật Gân', '4K UHD'],
    synopsis: 'Trải nghiệm khoảnh khắc thế giới rơi vào tĩnh lặng khi những sinh vật ngoài hành tinh nhạy cảm với âm thanh tấn công thành phố New York sầm uất.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-17',
    rank: 17,
    title: 'Kung Fu Panda 4: Long Thần Trở Lại',
    rating: '8.5',
    year: '2024',
    category: 'comedy',
    tags: ['Hoạt Hình', 'Võ Thuật', 'Hài Hước'],
    synopsis: 'Po chuẩn bị trở thành Thủ Lĩnh Tinh Thần của Thung Lũng Hòa Bình, nhưng phải tìm và huấn luyện một Thần Long Đại Hiệp mới trước khi ác nhân Chameleon thức tỉnh.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-18',
    rank: 18,
    title: 'Vương Triều Sụp Đổ: Bí Mật Hoàng Cung',
    rating: '8.7',
    year: '2024',
    category: 'fantasy',
    tags: ['Cổ Trang', 'Kịch Tính', 'Hậu Cung'],
    synopsis: 'Cuộc chiến quyền lực ngầm khốc liệt giữa các phi tần và các thế lực hoàng tộc nhằm kiểm soát ngai vàng vương triều hưng thịnh nhất phương Đông.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-19',
    rank: 19,
    title: 'Kingdom: Vương Quốc Xác Sống',
    rating: '8.8',
    year: '2023',
    category: 'horror',
    tags: ['Cổ Trang', 'Zombie', 'Hành Động'],
    synopsis: 'Thái tử thời Joseon điều tra dịch bệnh kỳ quái đang biến người dân thành xác sống khát máu giữa lúc triều đình đang âm mưu lật đổ vương quyền.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'tr-20',
    rank: 20,
    title: 'Arcane: Liên Minh Huyền Thoại',
    rating: '9.3',
    year: '2024',
    category: 'anime',
    tags: ['Hoạt Hình', 'Giả Tưởng', 'Dolby Vision'],
    synopsis: 'Giữa sự chia cắt sâu sắc của thành phố hiện đại Piltover và khu ổ chuột tăm tối Zaun, hai chị em Vi và Jinx bước vào cuộc chiến nghiệt ngã định đoạt tương lai cả vùng đất.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function TrendingRankingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const filteredMovies = useMemo(() => {
    const list =
      selectedCategory === 'all'
        ? TOP_20_MOVIES
        : TOP_20_MOVIES.filter((m) => m.category === selectedCategory);

    // Sắp xếp lại thứ hạng bắt đầu từ Top 1 cho thể loại được chọn
    return list.map((item, index) => ({
      ...item,
      currentRank: index + 1,
    }));
  }, [selectedCategory]);

  // Lấy ảnh backdrop của phim Top 1 trong danh sách hiện tại
  const topMovie = filteredMovies[0];
  const heroBackdropUri =
    topMovie?.backdrop ||
    topMovie?.image ||
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop';

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Khám phá Bảng Xếp Hạng Top 20 Phim Thịnh Hành trên CineStream!',
        title: 'Bảng Xếp Hạng Phim CineStream',
      });
    } catch {
      // ignore
    }
  };

  // Render Rank Badge helper
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <View style={[styles.rankBadge, styles.rankBadgeGold]}>
          <Text style={styles.rankBadgeTextGold}>1</Text>
        </View>
      );
    }
    if (rank === 2) {
      return (
        <View style={[styles.rankBadge, styles.rankBadgeSilver]}>
          <Text style={styles.rankBadgeTextSilver}>2</Text>
        </View>
      );
    }
    if (rank === 3) {
      return (
        <View style={[styles.rankBadge, styles.rankBadgeBronze]}>
          <Text style={styles.rankBadgeTextBronze}>3</Text>
        </View>
      );
    }
    return (
      <View style={[styles.rankBadge, styles.rankBadgeNormal]}>
        <Text style={styles.rankBadgeTextNormal}>{rank}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ----------------- TOP 20 LIST (FLATLIST) ----------------- */}
      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Hero Header Banner with Dynamic Backdrop */}
            <View style={styles.heroBannerWrapper}>
              <Image
                key={heroBackdropUri}
                source={{
                  uri: heroBackdropUri,
                }}
                style={styles.heroBackdrop}
              />
              {/* <View style={styles.heroGradientOverlay} /> */}

              {/* Navigation Bar Icons */}
              <View style={styles.navBarRow}>
                <TouchableOpacity
                  style={styles.circleIconButton}
                  onPress={() => router.back()}
                  activeOpacity={0.75}
                >
                  <Ionicons name="chevron-back" size={22} color={CinemaColors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.circleIconButton}
                  onPress={handleShare}
                  activeOpacity={0.75}
                >
                  <Ionicons name="share-social-outline" size={20} color={CinemaColors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Header Title & Subtitle */}
              <View style={styles.headerTitleContainer}>
                <Text style={styles.mainTitle}>Bảng Xếp Hạng</Text>
                <Text style={styles.mainSubtitle}>
                  Xếp hạng dựa trên độ hot của nội dung, được cập nhật hàng ngày
                </Text>
              </View>
            </View>

            {/* Category Filter Tabs (Horizontal Scroll) */}
            <View style={styles.categoryTabsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryTabsContent}
              >
                {RANKING_CATEGORIES.map((tab) => {
                  const isSelected = selectedCategory === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
                      onPress={() => setSelectedCategory(tab.id)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.categoryTabText,
                          isSelected && styles.categoryTabTextSelected,
                        ]}
                      >
                        {tab.label}
                      </Text>
                      {isSelected && <View style={styles.activeTabIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={48} color={CinemaColors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có phim trong danh mục này</Text>
            <Text style={styles.emptySubtitle}>
              Hãy chọn danh mục khác để xem bảng xếp hạng thịnh hành.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSaved = bookmarkedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={styles.movieItemCard}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/movie/[id]', params: { id: item.id } })}
            >
              {/* Left Column: Poster Image with Top-Left Rank Badge */}
              <View style={styles.posterWrapper}>
                <Image source={{ uri: item.image }} style={styles.posterImage} />
                {renderRankBadge(item.currentRank)}

                {/* Rating Badge Bottom-Right */}
                <View style={styles.posterRatingBadge}>
                  <Ionicons name="star" size={10} color="#FFD700" />
                  <Text style={styles.posterRatingText}>{item.rating}</Text>
                </View>
              </View>

              {/* Right Column: Title, Tag Pills, Synopsis & Bookmark Action */}
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
                  <View style={styles.yearTagPill}>
                    <Text style={styles.yearTagText}>{item.year}</Text>
                  </View>
                </View>

                {/* Short Synopsis Description */}
                <Text style={styles.synopsisText} numberOfLines={2}>
                  {item.synopsis}
                </Text>

                {/* Bottom Row Action */}
                <View style={styles.bottomRow}>
                  <View style={styles.rankStatusRow}>
                    <Ionicons name="trending-up" size={14} color={CinemaColors.primary} />
                    <Text style={styles.rankStatusText}>Hạng #{item.currentRank} hôm nay</Text>
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
  listContent: {
    paddingBottom: 36,
  },

  /* Hero Header */
  heroBannerWrapper: {
    height: 250,
    position: 'relative',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroBackdrop: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 10, 15, 0.75)',
  },
  navBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  circleIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 20, 28, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleContainer: {
    zIndex: 10,
  },
  hotTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: CinemaColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  hotTagPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    lineHeight: 16,
  },

  /* Category Filter Tabs */
  categoryTabsWrapper: {
    backgroundColor: CinemaColors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    marginBottom: 12,
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
    gap: 18,
  },
  categoryTab: {
    paddingVertical: 4,
    position: 'relative',
  },
  categoryTabSelected: {},
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  categoryTabTextSelected: {
    fontSize: 14.5,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: CinemaColors.primary,
  },

  /* Ranked Movie Card */
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

  /* Rank Badge */
  rankBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  rankBadgeGold: {
    backgroundColor: '#FF334B',
    borderColor: '#FFD700',
  },
  rankBadgeTextGold: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rankBadgeSilver: {
    backgroundColor: '#2A2E3D',
    borderColor: '#C0C0C0',
  },
  rankBadgeTextSilver: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rankBadgeBronze: {
    backgroundColor: '#2A2E3D',
    borderColor: '#CD7F32',
  },
  rankBadgeTextBronze: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rankBadgeNormal: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  rankBadgeTextNormal: {
    fontSize: 12,
    fontWeight: '800',
    color: CinemaColors.textPrimary,
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
  yearTagPill: {
    backgroundColor: 'rgba(255, 51, 75, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 51, 75, 0.25)',
  },
  yearTagText: {
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
  rankStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: CinemaColors.primary,
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

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CinemaColors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: CinemaColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
