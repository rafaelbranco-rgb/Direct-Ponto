import { useSyncExternalStore } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';

import { BrandHeader } from '@/components/brand-header';
import { ScreenBackground } from '@/components/screen-bg';
import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth';
import {
  assinarNotificacoes,
  getNotificacoes,
  marcarTodasLidas,
  versaoNotificacoes,
  versaoServidor,
} from '@/data/notifications';

export default function Notificacoes() {
  const router = useRouter();
  const theme = useTheme();
  const escuro = useColorScheme() === 'dark';
  const { usuario } = useAuth();

  useSyncExternalStore(assinarNotificacoes, versaoNotificacoes, versaoServidor);
  const itens = getNotificacoes();

  if (!usuario) return <Redirect href="/login" />;

  const iconColor = escuro ? '#9DBBF0' : Brand.primary;
  const dotBg = escuro ? 'rgba(125,167,255,0.16)' : 'rgba(35,79,160,0.10)';

  return (
    <View style={styles.screen}>
      <ScreenBackground />

      <BrandHeader>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={Brand.onPrimary} />
          </Pressable>
          <Ionicons name="notifications-outline" size={22} color={Brand.onPrimary} />
          <Text style={styles.titulo}>Notificações</Text>
          {itens.some((n) => !n.lida) && (
            <Pressable onPress={marcarTodasLidas} hitSlop={8}>
              <Text style={styles.marcarTodas}>Marcar lidas</Text>
            </Pressable>
          )}
        </View>
      </BrandHeader>

      <Animated.View style={styles.corpo} entering={FadeInDown.duration(300)}>
        <FlatList
          data={itens}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/categoria/[codigo]', params: { codigo: item.categoria } })
              }
              style={({ pressed }) => [
                styles.linha,
                { borderBottomColor: theme.backgroundSelected },
                pressed && { backgroundColor: theme.backgroundElement },
              ]}>
              <View style={[styles.dot, { backgroundColor: dotBg }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={iconColor} />
                {!item.lida && <View style={styles.naoLida} />}
              </View>
              <View style={styles.meio}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {item.titulo}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                  {item.corpo}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {item.horario}
              </ThemedText>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name="notifications-off-outline" size={40} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.vazioTxt}>
                Sem notificações por enquanto. Quando o atendimento responder, avisamos aqui.
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
  marcarTodas: { color: Brand.onPrimary, fontSize: 13, fontWeight: '600', opacity: 0.9 },

  corpo: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  listContent: { paddingVertical: Spacing.one },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  naoLida: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Brand.accent,
  },
  meio: { flex: 1, gap: 2 },
  vazio: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.six, paddingHorizontal: Spacing.four },
  vazioTxt: { textAlign: 'center', lineHeight: 20 },
});
