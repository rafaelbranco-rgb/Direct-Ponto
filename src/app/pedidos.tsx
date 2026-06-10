import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';

import { BrandHeader } from '@/components/brand-header';
import { PedidoCard } from '@/components/pedido-card';
import { ScreenBackground } from '@/components/screen-bg';
import { ThemedText } from '@/components/themed-text';
import { TiltCard } from '@/components/tilt-card';
import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth';
import { SOLICITACOES } from '@/data/mock';
import type { StatusColaborador } from '@/data/types';

type Filtro = 'TODOS' | StatusColaborador;

const FILTROS: { chave: Filtro; label: string }[] = [
  { chave: 'TODOS', label: 'Todos' },
  { chave: 'PENDENTE', label: 'Pendentes' },
  { chave: 'APROVADO', label: 'Aprovados' },
  { chave: 'RECUSADO', label: 'Recusados' },
];

export default function Pedidos() {
  const router = useRouter();
  const theme = useTheme();
  const { usuario } = useAuth();
  const [filtro, setFiltro] = useState<Filtro>('TODOS');

  const pedidos = useMemo(
    () => [...SOLICITACOES].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    [],
  );
  const contagem = useMemo(() => {
    const c: Record<Filtro, number> = { TODOS: pedidos.length, PENDENTE: 0, APROVADO: 0, RECUSADO: 0 };
    for (const p of pedidos) c[p.status] += 1;
    return c;
  }, [pedidos]);
  const lista = useMemo(
    () => (filtro === 'TODOS' ? pedidos : pedidos.filter((p) => p.status === filtro)),
    [pedidos, filtro],
  );

  if (!usuario) return <Redirect href="/login" />;

  return (
    <View style={styles.screen}>
      <ScreenBackground />

      <BrandHeader>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={Brand.onPrimary} />
          </Pressable>
          <Ionicons name="document-text-outline" size={22} color={Brand.onPrimary} />
          <Text style={styles.titulo}>Meus Pedidos</Text>
        </View>

        {/* Filtros por status */}
        <View style={styles.filtros}>
          {FILTROS.map((f) => {
            const ativo = filtro === f.chave;
            return (
              <Pressable
                key={f.chave}
                onPress={() => setFiltro(f.chave)}
                style={[styles.chip, ativo ? styles.chipAtivo : styles.chipInativo]}>
                <Text style={[styles.chipTxt, { color: ativo ? Brand.primary : Brand.onPrimary }]}>
                  {f.label} ({contagem[f.chave]})
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BrandHeader>

      <Animated.View style={styles.corpo} entering={FadeInDown.duration(300)}>
        <FlatList
          data={lista}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <TiltCard max={3}>
              <PedidoCard pedido={item} />
            </TiltCard>
          )}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name="file-tray-outline" size={40} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.vazioTxt}>
                Nenhum pedido {filtro !== 'TODOS' ? 'neste status' : 'ainda'}.
              </ThemedText>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  titulo: { color: Brand.onPrimary, fontSize: 20, fontWeight: '700', flex: 1 },

  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  chipAtivo: { backgroundColor: Brand.onPrimary, borderColor: Brand.onPrimary },
  chipInativo: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.45)' },
  chipTxt: { fontSize: 13, fontWeight: '700' },

  corpo: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  listContent: { padding: Spacing.three },
  sep: { height: Spacing.three },
  vazio: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.six },
  vazioTxt: { textAlign: 'center' },
});
