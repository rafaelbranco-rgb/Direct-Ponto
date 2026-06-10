import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { NotifToast } from '@/components/notif-toast';
import { AuthProvider } from '@/context/auth';
import { ThemePrefProvider } from '@/context/theme-pref';
import { useColorScheme } from '@/hooks/use-color-scheme';

function Conteudo() {
  const esquema = useColorScheme();
  return (
    <ThemeProvider value={esquema === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {/* Header próprio (com a marca) é renderizado dentro de cada tela. */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="index" />
        <Stack.Screen name="pedidos" />
        <Stack.Screen name="notificacoes" />
        <Stack.Screen name="categoria/[codigo]" />
      </Stack>
      <NotifToast />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemePrefProvider>
        <AuthProvider>
          <Conteudo />
        </AuthProvider>
      </ThemePrefProvider>
    </SafeAreaProvider>
  );
}
