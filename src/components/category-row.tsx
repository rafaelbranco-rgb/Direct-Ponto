import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Categoria } from '@/data/types';

type Props = {
  categoria: Categoria;
  previewTexto: string;
  previewHora?: string;
  vazio?: boolean;
  onPress: () => void;
};

export function CategoryRow({ categoria, previewTexto, previewHora, vazio, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.backgroundSelected },
        pressed && { backgroundColor: theme.backgroundSelected },
      ]}>
      <View style={styles.avatar}>
        <Ionicons name={categoria.icone as keyof typeof Ionicons.glyphMap} size={24} color={Brand.primary} />
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

      {previewHora ? (
        <ThemedText type="small" themeColor="textSecondary">
          {previewHora}
        </ThemedText>
      ) : null}
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
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(35,79,160,0.10)',
  },
  middle: { flex: 1, gap: 2 },
  vazio: { fontStyle: 'italic' },
});
