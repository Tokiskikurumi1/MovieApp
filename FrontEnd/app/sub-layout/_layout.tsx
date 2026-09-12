import { Stack } from 'expo-router';

export default function SubLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="account-security" />
      <Stack.Screen name="billing-subscription" />
      <Stack.Screen name="help-center" />
      <Stack.Screen name="terms-privacy" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="continue-watching" />
      <Stack.Screen name="trending" />
      <Stack.Screen name="collection" />
    </Stack>
  );
}
