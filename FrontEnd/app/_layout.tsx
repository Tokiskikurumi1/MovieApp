import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { NotificationProvider } from '@/store/notification-context';
import { FavoriteProvider } from '@/store/favorite-context';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotificationProvider>
        <FavoriteProvider>
          <Stack initialRouteName="(auth)">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="watch/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="sub-layout" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </FavoriteProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
