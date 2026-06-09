import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';

import { CategoryRow } from '@/components/category-row';
import { GlassSurface } from '@/components/glass';
import { ScreenBackground } from '@/components/screen-bg';
import { SearchBar } from '@/components/search-bar';
import { SettingsDrawer } from '@/components/settings-drawer';
import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { CATEGORIAS } from '@/data/mock';
import { ultimaMensagem } from '@/data/chat';

export default function CaixaDeEntrada() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [busca, setBusca] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [, setTick] = useState(0);

  useFocusEffect(useCallback(() => setTick((t) => t + 1), []));

  const categorias = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return CATEGORIAS;
    return CATEGORIAS.filter(
      (c) =>
        c.label.toLowerCase().includes(termo) || c.descricao.toLowerCase().includes(termo),
    );
  }, [busca]);

  if (!usuario) return <Redirect href="/login" />;

  return (
    <View style={styles.screen}>
      <ScreenBackground />

      {/* Cabeçalho de vidro com a marca */}
      <GlassSurface marca intensidade={50} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.topRow}>
              <Text style={styles.greeting} numberOfLines={1}>
                Olá, {usuario.identificador}
              </Text>
              <Pressable onPress={() => setDrawer(true)} hitSlop={10}>
                <Ionicons name="settings-outline" size={24} color={Brand.onPrimary} />
              </Pressable>
            </View>
            <View style={styles.brandRow}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>{Brand.company[0]}</Text>
              </View>
              <View>
                <Text style={styles.appName}>{Brand.appName}</Text>
                <Text style={styles.tagline}>{Brand.tagline}</Text>
              </View>
            </View>
            <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar categoria" />
          </View>
        </SafeAreaView>
      </GlassSurface>

      {/* Lista de assuntos em cartão de vidro */}
      <View style={styles.corpo}>
        <GlassSurface style={styles.cartao}>
          <FlatList
            data={categorias}
            keyExtractor={(c) => c.codigo}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const ultima = ultimaMensagem(item.codigo);
              const previewTexto = ultima
                ? ultima.texto || (ultima.anexo ? 'Anexo enviado' : (ultima.data ?? ''))
                : 'Toque para iniciar atendimento';
              return (
                <CategoryRow
                  categoria={item}
                  previewTexto={previewTexto}
                  previewHora={ultima?.horario}
                  vazio={!ultima}
                  onPress={() =>
                    router.push({ pathname: '/categoria/[codigo]', params: { codigo: item.codigo } })
                  }
                />
              );
            }}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                Nenhuma categoria encontrada para “{busca}”.
              </ThemedText>
            }
          />
        </GlassSurface>
      </View>

      <SettingsDrawer visivel={drawer} aoFechar={() => setDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { color: Brand.onPrimary, opacity: 0.95, fontSize: 14, fontWeight: '600', flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Brand.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: Brand.primary, fontWeight: '800', fontSize: 20 },
  appName: { color: Brand.onPrimary, fontSize: 20, fontWeight: '700' },
  tagline: { color: Brand.onPrimary, opacity: 0.85, fontSize: 13 },

  corpo: {
    flex: 1,
    padding: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  cartao: { flex: 1 },
  listContent: { paddingVertical: Spacing.one },
  empty: { textAlign: 'center', marginTop: Spacing.five },
});
