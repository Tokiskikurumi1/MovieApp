import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CinemaColors } from '@/constants/theme';

// -------------------------------------------------------------
// 1. Icon Logo riêng lẻ (BrandIcon)
// -------------------------------------------------------------
interface BrandIconProps {
  size?: number;
  badgeSize?: number;
  style?: ViewStyle;
}

export function BrandIcon({ size = 26, badgeSize = 52, style }: BrandIconProps) {
  return (
    <View
      style={[
        styles.logoBadge,
        {
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 3,
        },
        style,
      ]}
    >
      <Ionicons name="film" size={size} color={CinemaColors.primary} />
    </View>
  );
}

// -------------------------------------------------------------
// 2. Chữ Tên Thương Hiệu riêng lẻ (BrandTitle)
// -------------------------------------------------------------
interface BrandTitleProps {
  fontSize?: number;
  letterSpacing?: number;
  style?: TextStyle;
}

export function BrandTitle({ fontSize = 22, letterSpacing = 2, style }: BrandTitleProps) {
  return (
    <Text style={[styles.brandTitle, { fontSize, letterSpacing }, style]}>
      CINE<Text style={styles.brandTitleAccent}>STREAM</Text>
    </Text>
  );
}

// -------------------------------------------------------------
// 3. Logo hoàn chỉnh (Hỗ trợ cả Hàng Dọc & Hàng Ngang - cạnh nhau)
// -------------------------------------------------------------
interface BrandLogoProps {
  layout?: 'vertical' | 'horizontal'; // Dọc (icon trên chữ) hoặc Ngang (icon cạnh chữ)
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  style?: ViewStyle;
}

export function BrandLogo({
  layout = 'vertical',
  size = 'medium',
  showTagline = true,
  style,
}: BrandLogoProps) {
  const isHorizontal = layout === 'horizontal';
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  // Dynamic sizes based on mode
  const iconSize = isSmall ? 18 : isLarge ? 32 : 24;
  const badgeSize = isSmall ? 36 : isLarge ? 62 : 48;
  const fontSize = isSmall ? 16 : isLarge ? 26 : 22;

  if (isHorizontal) {
    return (
      <View style={[styles.horizontalContainer, style]}>
        <BrandIcon size={iconSize} badgeSize={badgeSize} />
        <View style={styles.horizontalTextContainer}>
          <BrandTitle fontSize={fontSize} letterSpacing={1.5} />
          {showTagline && (
            <Text style={styles.horizontalTagline}>4K HDR Streaming</Text>
          )}
        </View>
      </View>
    );
  }

  // Vertical layout (Mặc định)
  return (
    <View style={[styles.verticalContainer, style]}>
      <BrandIcon size={iconSize} badgeSize={badgeSize} style={{ marginBottom: 10 }} />
      <BrandTitle fontSize={fontSize} />
      {showTagline && !isSmall && (
        <Text style={styles.brandTagline}>Kho phim chất lượng cao 4K & HDR</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logoBadge: {
    backgroundColor: CinemaColors.primaryLight,
    borderWidth: 1.5,
    borderColor: CinemaColors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '800',
    color: CinemaColors.textPrimary,
  },
  brandTitleAccent: {
    color: CinemaColors.primary,
  },
  brandTagline: {
    fontSize: 12,
    color: CinemaColors.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  verticalContainer: {
    alignItems: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  horizontalTextContainer: {
    justifyContent: 'center',
  },
  horizontalTagline: {
    fontSize: 10,
    color: CinemaColors.textSecondary,
    marginTop: 1,
  },
});
