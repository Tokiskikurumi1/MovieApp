import { Platform } from 'react-native';

export const CinemaTheme = {
  colors: {
    // Primary (Red accents)
    primary: '#FF334B',
    primaryHover: '#D82C40',
    primaryLight: 'rgba(255, 51, 75, 0.15)',
    primaryGlow: 'rgba(255, 51, 75, 0.35)',
    primaryBorder: 'rgba(255, 51, 75, 0.3)',

    // Dark backgrounds & surfaces
    background: '#090A0F',
    surface: '#12141C',
    surfaceFocused: '#151824',
    surfaceElevated: '#1C202E',
    surfaceSocial: '#141722',
    border: '#1F2433',
    borderLight: '#222838',
    borderActive: '#FF334B',

    // Ambient Glows
    glowTopRight: 'rgba(255, 51, 75, 0.12)',
    glowBottomLeft: 'rgba(99, 102, 241, 0.08)',

    // Text & Typography
    textPrimary: '#FFFFFF',
    textSecondary: '#8E95A5',
    textTertiary: '#C5C9D5',
    textMuted: '#5A6175',
    textDivider: '#656D82',
    textGuest: '#767F94',
    textCheckbox: '#9BA1B2',

    // Social Brand Colors
    google: '#EA4335',
    apple: '#FFFFFF',
    facebook: '#1877F2',

    // Functional Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};

export const CinemaColors = CinemaTheme.colors;

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
