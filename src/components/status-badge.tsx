import { StyleSheet, Text, View } from 'react-native';

import { StatusUI } from '@/constants/brand';
import type { StatusColaborador } from '@/data/types';

export function StatusBadge({ status }: { status: StatusColaborador }) {
  const s = StatusUI[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
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
