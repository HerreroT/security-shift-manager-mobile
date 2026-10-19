import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Palette } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';

// Keep the splash screen until the saved session is read, so the login does not flash.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack
      screenOptions={{
        headerTintColor: Palette.primary,
        headerTitleStyle: { color: Palette.text },
        headerBackTitle: 'Atrás',
        contentStyle: { backgroundColor: Palette.background },
      }}>
      <Stack.Protected guard={session !== null}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="guards/[id]" options={{ title: 'Guardia' }} />
        <Stack.Screen name="guards/form" options={{ title: 'Guardia' }} />
        <Stack.Screen name="services/[id]" options={{ title: 'Servicio' }} />
        <Stack.Screen name="services/form" options={{ title: 'Servicio' }} />
        <Stack.Screen name="shifts/form" options={{ title: 'Turno' }} />
        <Stack.Screen name="reports/monthly" options={{ title: 'Reporte mensual' }} />
      </Stack.Protected>
      <Stack.Protected guard={session === null}>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
