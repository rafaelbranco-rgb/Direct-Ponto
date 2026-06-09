import { BlurView } from 'expo-blur';
import { StyleSheet, type ViewStyle } from 'react-native';

import { Vidro, VidroMarca } from '@/constants/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Intensidade do desfoque (0–100). */
  intensidade?: number;
  /** Usa a tintura da marca (azul) em vez da neutra. */
  marca?: boolean;
};

/** Superfície de vidro (liquid glass): desfoque + tintura translúcida + borda fina. */
export function GlassSurface({ children, style, intensidade = 28, marca = false }: Props) {
  const esquema = useColorScheme();
  const v = marca ? VidroMarca[esquema] : Vidro[esquema];

  return (
    <BlurView
      intensity={intensidade}
      tint={v.tint}
      style={[
        styles.base,
        { backgroundColor: v.overlay, borderColor: v.border },
        style,
      ]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
