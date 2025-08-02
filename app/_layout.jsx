import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login or Sign Up' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="signin" options={{ title: 'Login' }} />
      <Stack.Screen name="chatbot" options={{ title: 'Chatbot' }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}