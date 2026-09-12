import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CinemaColors } from '@/constants/theme';
import { BrandLogo } from '@/components/brand-logo';
import { useNotifications } from '@/store/notification-context';

interface TopAppBarProps {
  avatarUri?: string;
  hasNotification?: boolean;
  showSearch?: boolean;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  rightActions?: React.ReactNode;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';

export const TopAppBar: React.FC<TopAppBarProps> = ({
  avatarUri = DEFAULT_AVATAR,
  hasNotification,
  showSearch = false,
  onSearchPress,
  onNotificationPress,
  onAvatarPress,
  rightActions,
}) => {
  const router = useRouter();
  const { hasUnread } = useNotifications();
  const showBadge = hasNotification !== undefined ? hasNotification : hasUnread;

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/sub-layout/notifications' as any);
    }
  };

  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else {
      router.push('/(tabs)/profile' as any);
    }
  };

  return (
    <View style={styles.appBar}>
      <BrandLogo layout="horizontal" size="small" showTagline={false} />

      <View style={styles.appBarActions}>
        {rightActions}

        {showSearch && (
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={onSearchPress}
          >
            <Ionicons name="search" size={20} color={CinemaColors.textPrimary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={handleNotificationPress}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={CinemaColors.textPrimary}
          />
          {showBadge && <View style={styles.notificationBadge} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarButton}
          activeOpacity={0.8}
          onPress={handleAvatarPress}
        >
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatarImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: CinemaColors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CinemaColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CinemaColors.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CinemaColors.primary,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: CinemaColors.primary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
