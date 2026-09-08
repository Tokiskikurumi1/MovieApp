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
    // Tổng số nút hiển thị: siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    // Trường hợp 1: Tổng số trang ít hơn số nút dự kiến hiển thị
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Trường hợp 2: Chỉ có dấu ... bên phải (ví dụ: < 1 2 3 ... 10 >)
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    // Trường hợp 3: Chỉ có dấu ... bên trái (ví dụ: < 1 ... 8 9 10 >)
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Trường hợp 4: Có cả dấu ... bên trái và bên phải (ví dụ: < 1 ... 4 5 6 ... 10 >)
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return range(1, totalPages);
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
            key={`page-${pageNumber}`}
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
