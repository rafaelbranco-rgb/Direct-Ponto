import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { Gradiente } from '@/constants/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Gradiente de fundo do app, preenchendo a tela toda (atrás do conteúdo). */
export function ScreenBackground() {
  const esquema = useColorScheme();
  return (
    <LinearGradient
      colors={Gradiente[esquema]}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
}
