import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import type { Categoria } from '@/data/types';

type Props = {
  categoria: Categoria;
  previewTexto: string;
  previewHora?: string;
  vazio?: boolean;
  naoLidas?: number;
  onPress: () => void;
};

export function CategoryRow({ categoria, previewTexto, previewHora, vazio, naoLidas = 0, onPress }: Props) {
  const theme = useTheme();
  const escuro = useColorScheme() === 'dark';
  const [hover, setHover] = useState(false);

  // Acentos legíveis em cada tema (azul claro no escuro; azul da marca no claro).
  const avatarBg = escuro ? 'rgba(125,167,255,0.14)' : 'rgba(35,79,160,0.10)';
  const iconColor = escuro ? '#9DBBF0' : Brand.primary;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.backgroundSelected },
        hover && Platform.OS === 'web' && {
          backgroundColor: theme.backgroundElement,
          transform: [{ translateY: -1 }],
        },
        pressed && { backgroundColor: theme.backgroundSelected },
      ]}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Ionicons name={categoria.icone as keyof typeof Ionicons.glyphMap} size={24} color={iconColor} />
      </View>

      <View style={styles.middle}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {categoria.label}
        </ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          numberOfLines={1}
          style={vazio ? styles.vazio : undefined}>
          {previewTexto}
        </ThemedText>
      </View>

      <View style={styles.right}>
        {previewHora ? (
          <ThemedText type="small" themeColor="textSecondary">
            {previewHora}
          </ThemedText>
        ) : null}
        {naoLidas > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{naoLidas > 9 ? '9+' : naoLidas}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Platform.select({ web: { transition: 'background-color 160ms, transform 160ms' } as object, default: {} }),
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: { flex: 1, gap: 2 },
  vazio: { fontStyle: 'italic' },
  right: { alignItems: 'flex-end', gap: 5 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { color: Brand.onPrimary, fontSize: 11, fontWeight: '800' },
});
