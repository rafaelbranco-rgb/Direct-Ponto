import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { Vidro } from '@/constants/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Mais opaco (melhor legibilidade sobre fundos saturados). */
  forte?: boolean;
};

/** Superfície de vidro (liquid glass): translúcida, borda fina e sombra suave. */
export function GlassSurface({ children, style, forte = false }: Props) {
  const v = Vidro[useColorScheme()];
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: forte ? v.overlayForte : v.overlay, borderColor: v.border },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(0,0,0,0.10)' } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      },
    }),
  },
});
