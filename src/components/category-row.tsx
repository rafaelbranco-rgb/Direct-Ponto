import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Categoria } from '@/data/types';

type Props = {
  categoria: Categoria;
  previewTexto: string;
  previewHora?: string;
  /** Em branco/itálico quando ainda não há mensagens. */
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
        { borderBottomColor: theme.backgroundElement },
        pressed && { backgroundColor: theme.backgroundElement },
      ]}>
      <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}>
        <Text style={styles.emoji}>{categoria.emoji}</Text>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 24 },
  middle: { flex: 1, gap: 2 },
  vazio: { fontStyle: 'italic' },
});
