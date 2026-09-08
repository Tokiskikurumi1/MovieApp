import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CinemaColors } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: CinemaColors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgotPass" />
      </Stack>
    </>
  );
}
