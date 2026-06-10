import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';

import { BrandHeader } from '@/components/brand-header';
import { CategoryRow } from '@/components/category-row';
import { GlassSurface } from '@/components/glass';
import { ScreenBackground } from '@/components/screen-bg';
import { SearchBar } from '@/components/search-bar';
import { SettingsDrawer } from '@/components/settings-drawer';
import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { CATEGORIAS } from '@/data/mock';
import { ultimaMensagem } from '@/data/chat';
import {
  assinarNotificacoes,
  naoLidasCategoria,
  totalNaoLidas,
  versaoNotificacoes,
  versaoServidor,
} from '@/data/notifications';

export default function CaixaDeEntrada() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [busca, setBusca] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [, setTick] = useState(0);

  useFocusEffect(useCallback(() => setTick((t) => t + 1), []));
  useSyncExternalStore(assinarNotificacoes, versaoNotificacoes, versaoServidor);
  const naoLidas = totalNaoLidas();

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

      <BrandHeader>
        <View style={styles.topRow}>
          <Text style={styles.greeting} numberOfLines={1}>
            Olá, {usuario.identificador}
          </Text>
          <View style={styles.acoes}>
            <Pressable onPress={() => router.push('/pedidos')} hitSlop={10}>
              <Ionicons name="document-text-outline" size={23} color={Brand.onPrimary} />
            </Pressable>
            <Pressable onPress={() => router.push('/notificacoes')} hitSlop={10}>
              <View>
                <Ionicons name="notifications-outline" size={23} color={Brand.onPrimary} />
                {naoLidas > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeTxt}>{naoLidas > 9 ? '9+' : naoLidas}</Text>
                  </View>
                )}
              </View>
            </Pressable>
            <Pressable onPress={() => setDrawer(true)} hitSlop={10}>
              <Ionicons name="menu" size={26} color={Brand.onPrimary} />
            </Pressable>
          </View>
        </View>
        <View style={styles.brandRow}>
          <Image
            source={require('@/assets/images/logo-contato.png')}
            style={styles.emblema}
            contentFit="contain"
          />
          <View style={styles.brandText}>
            <Text style={styles.appName}>{Brand.appName}</Text>
            <Text style={styles.tagline}>{Brand.tagline}</Text>
          </View>
        </View>
        <SearchBar value={busca} onChangeText={setBusca} placeholder="Buscar categoria" />
      </BrandHeader>

      <Animated.View style={styles.corpo} entering={FadeInDown.duration(320)}>
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
                  naoLidas={naoLidasCategoria(item.codigo)}
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
      </Animated.View>

      <SettingsDrawer visivel={drawer} aoFechar={() => setDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  badge: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { color: '#3A2A06', fontSize: 10, fontWeight: '800' },
  greeting: { color: Brand.onPrimary, opacity: 0.95, fontSize: 14, fontWeight: '600', flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  emblema: {
    width: 52,
    height: 44,
    ...Platform.select({
      web: { filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))' } as object,
      default: {},
    }),
  },
  brandText: { gap: 1 },
  appName: {
    color: Brand.onPrimary,
    fontFamily: Fonts.brand,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  tagline: { color: 'rgba(255,255,255,0.82)', fontSize: 12.5, letterSpacing: 0.3 },

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
