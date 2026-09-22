import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  style?: ViewStyle;
}

export const DOTS = '...';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  style,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const getPaginationRange = (): (number | string)[] => {
    // Nếu tổng số trang nhỏ hơn hoặc bằng 5, hiển thị tất cả các trang
    if (totalPages <= 5) {
      return range(1, totalPages);
    }

    // Trường hợp 1: Khi đang ở các trang đầu (1, 2)
    // Hiển thị kiểu: 1 2 ... n
    if (currentPage <= 2) {
      return [1, 2, DOTS, totalPages];
    }

    // Trường hợp 2: Khi đang ở các trang cuối (totalPages - 1, totalPages)
    // Hiển thị kiểu: 1 ... n-1 n
    if (currentPage >= totalPages - 1) {
      return [1, DOTS, totalPages - 1, totalPages];
    }

    // Trường hợp 3: Khi đang ở các trang giữa (3 <= currentPage <= totalPages - 2)
    // Hiển thị kiểu: 1 ... 3 4 ... n (hoặc các cặp trang tương ứng ở giữa như 5 6, 7 8...)
    let midStart = currentPage % 2 === 1 ? currentPage : currentPage - 1;
    let midEnd = midStart + 1;

    // Giới hạn để mid không vượt quá totalPages - 2 hoặc nhỏ hơn 3
    if (midEnd > totalPages - 2) {
      midEnd = totalPages - 2;
      midStart = Math.max(3, midEnd - 1);
    }
    if (midStart < 3) {
      midStart = 3;
      midEnd = Math.min(totalPages - 2, midStart + 1);
    }

    const midRange = midStart === midEnd ? [midStart] : [midStart, midEnd];

    return [1, DOTS, ...midRange, DOTS, totalPages];
  };

  const paginationRange = getPaginationRange();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Nút Trước (<) */}
      <TouchableOpacity
        style={[styles.pageButton, styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={handlePrevious}
        disabled={currentPage === 1}
        activeOpacity={0.75}
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={currentPage === 1 ? CinemaColors.textMuted : CinemaColors.textPrimary}
        />
      </TouchableOpacity>

      {/* Dãy số trang và dấu ... (< 1 ... 4 5 6 ... n >) */}
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <View key={`dots-${index}`} style={styles.dotsContainer}>
              <Text style={styles.dotsText}>...</Text>
            </View>
          );
        }

        const isCurrent = pageNumber === currentPage;

        return (
          <TouchableOpacity
            key={`page-${pageNumber}-${index}`}
            style={[styles.pageButton, isCurrent && styles.activePageButton]}
            onPress={() => onPageChange(pageNumber as number)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pageText, isCurrent && styles.activePageText]}>
              {pageNumber}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Nút Kế tiếp (>) */}
      <TouchableOpacity
        style={[
          styles.pageButton,
          styles.navButton,
          currentPage === totalPages && styles.disabledButton,
        ]}
        onPress={handleNext}
        disabled={currentPage === totalPages}
        activeOpacity={0.75}
      >
        <Ionicons
          name="chevron-forward"
          size={18}
          color={currentPage === totalPages ? CinemaColors.textMuted : CinemaColors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  pageButton: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: CinemaColors.surface,
    borderWidth: 1,
    borderColor: CinemaColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: CinemaColors.surfaceElevated,
  },
  activePageButton: {
    backgroundColor: CinemaColors.primary,
    borderColor: CinemaColors.primary,
    shadowColor: CinemaColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.35,
    backgroundColor: CinemaColors.surface,
    borderColor: 'transparent',
  },
  pageText: {
    fontSize: 13,
    fontWeight: '600',
    color: CinemaColors.textSecondary,
  },
  activePageText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dotsContainer: {
    minWidth: 26,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsText: {
    fontSize: 13,
    fontWeight: '700',
    color: CinemaColors.textMuted,
    letterSpacing: 2,
  },
});
