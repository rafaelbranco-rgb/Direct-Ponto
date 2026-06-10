import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Gradiente } from '@/constants/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Gradiente de fundo do app. Faz um cross-fade suave entre claro/escuro quando
 * o tema muda (em vez de trocar de cor instantaneamente).
 */
export function ScreenBackground() {
  const esquema = useColorScheme();
  const p = useSharedValue(esquema === 'dark' ? 1 : 0);

  useEffect(() => {
    p.value = withTiming(esquema === 'dark' ? 1 : 0, { duration: 320 });
  }, [esquema, p]);

  const escuroStyle = useAnimatedStyle(() => ({ opacity: p.value }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={Gradiente.light}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View style={[StyleSheet.absoluteFill, escuroStyle]}>
        <LinearGradient
          colors={Gradiente.dark}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}
