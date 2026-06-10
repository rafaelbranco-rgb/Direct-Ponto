import { StyleSheet, Text, View } from 'react-native';

import { StatusUI } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { StatusColaborador } from '@/data/types';

export function StatusBadge({ status }: { status: StatusColaborador }) {
  const s = StatusUI[status];
  const c = s[useColorScheme()];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
