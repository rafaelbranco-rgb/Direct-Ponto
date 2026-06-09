import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';

import { CategoryRow } from '@/components/category-row';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { CATEGORIAS } from '@/data/mock';
import { ultimaMensagem } from '@/data/chat';

export default function CaixaDeEntrada() {
  const router = useRouter();
  const { usuario, sair } = useAuth();
  const [busca, setBusca] = useState('');
  const [, setTick] = useState(0);

  // Atualiza as prévias ao voltar de uma conversa.
  useFocusEffect(useCallback(() => setTick((t) => t + 1), []));

  // Sem usuário autenticado → vai para o login.
  if (!usuario) return <Redirect href="/login" />;

  const categorias = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return CATEGORIAS;
    return CATEGORIAS.filter(
      (c) =>
        c.label.toLowerCase().includes(termo) || c.descricao.toLowerCase().includes(termo),
    );
  }, [busca]);

  return (
    <ThemedView style={styles.screen}>
      {/* Cabeçalho com a marca da empresa + busca (estilo caixa de entrada) */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.topRow}>
              <Text style={styles.greeting} numberOfLines={1}>
                Olá 👋 {usuario.identificador}
              </Text>
              <Pressable onPress={sair} hitSlop={8}>
                <Text style={styles.sair}>Sair</Text>
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
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(c) => c.codigo}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const ultima = ultimaMensagem(item.codigo);
          const previewTexto = ultima
            ? ultima.texto || (ultima.anexo ? '📎 Anexo' : (ultima.data ?? ''))
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    backgroundColor: Brand.primary,
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { color: Brand.onPrimary, opacity: 0.95, fontSize: 14, fontWeight: '600', flex: 1 },
  sair: { color: Brand.onPrimary, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
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
  list: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: MaxContentWidth },
  listContent: { paddingBottom: Spacing.five },
  empty: { textAlign: 'center', marginTop: Spacing.five },
});
