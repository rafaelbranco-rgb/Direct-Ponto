import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { dataBR } from '@/data/format';
import { categoriaPorCodigo } from '@/data/mock';
import type { Solicitacao } from '@/data/types';

export function PedidoCard({ pedido }: { pedido: Solicitacao }) {
  const theme = useTheme();
  const escuro = useColorScheme() === 'dark';
  const cat = categoriaPorCodigo(pedido.categoria);

  const iconColor = escuro ? '#9DBBF0' : Brand.primary;
  const avatarBg = escuro ? 'rgba(125,167,255,0.14)' : 'rgba(35,79,160,0.10)';
  const temHorario = !!(pedido.horarioOriginal || pedido.horarioProposto);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
      ]}>
      <View style={styles.topo}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Ionicons
            name={(cat?.icone ?? 'help-circle-outline') as keyof typeof Ionicons.glyphMap}
            size={20}
            color={iconColor}
          />
        </View>
        <View style={styles.flex}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {cat?.label ?? pedido.categoria}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {dataBR(pedido.dataOcorrencia)}
          </ThemedText>
        </View>
        <StatusBadge status={pedido.status} />
      </View>

      {temHorario && (
        <View style={styles.horarios}>
          <Ionicons name="time-outline" size={15} color={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            {pedido.horarioOriginal ?? '—'}
          </ThemedText>
          <Ionicons name="arrow-forward" size={13} color={theme.textSecondary} />
          <ThemedText type="smallBold">{pedido.horarioProposto ?? '—'}</ThemedText>
        </View>
      )}

      <ThemedText type="small" style={styles.desc}>
        {pedido.descricao}
      </ThemedText>

      {pedido.temAnexo && (
        <View style={styles.anexo}>
          <Ionicons name="attach" size={15} color={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            Comprovante anexado
          </ThemedText>
        </View>
      )}

      {pedido.status === 'RECUSADO' && pedido.motivoRecusa && (
        <View style={styles.recusa}>
          <Ionicons name="alert-circle-outline" size={16} color="#C0341D" />
          <ThemedText type="small" style={styles.recusaTxt}>
            {pedido.motivoRecusa}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
    ...Platform.select({
      web: { boxShadow: '0 6px 18px rgba(0,0,0,0.10)' } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
      },
    }),
  },
  flex: { flex: 1 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horarios: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  desc: { lineHeight: 20 },
  anexo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recusa: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(192,52,29,0.10)',
    borderRadius: 10,
    padding: Spacing.two,
  },
  recusaTxt: { flex: 1, color: '#C0341D', lineHeight: 18 },
});
