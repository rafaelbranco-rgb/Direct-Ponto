import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { GlassSurface } from '@/components/glass';
import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemePref, type Preferencia } from '@/context/theme-pref';
import { useAuth } from '@/context/auth';

const OPCOES: { chave: Preferencia; label: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { chave: 'system', label: 'Sistema', icone: 'phone-portrait-outline' },
  { chave: 'light', label: 'Claro', icone: 'sunny-outline' },
  { chave: 'dark', label: 'Escuro', icone: 'moon-outline' },
];

export function SettingsDrawer({ visivel, aoFechar }: { visivel: boolean; aoFechar: () => void }) {
  const { width } = useWindowDimensions();
  const largura = Math.min(330, width * 0.85);
  const theme = useTheme();
  const { preferencia, definir } = useThemePref();
  const { sair } = useAuth();

  const [montado, setMontado] = useState(visivel);
  const tx = useRef(new Animated.Value(-largura)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visivel) {
      setMontado(true);
      Animated.parallel([
        Animated.timing(tx, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(op, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(tx, { toValue: -largura, duration: 220, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setMontado(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visivel, largura]);

  if (!montado) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: op }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} />
      </Animated.View>

      {/* Painel de vidro */}
      <Animated.View
        style={[styles.painel, { width: largura, transform: [{ translateX: tx }] }]}>
        <GlassSurface intensidade={40} style={styles.glass}>
          <SafeAreaView edges={['top', 'bottom']} style={styles.flex}>
            <View style={styles.conteudo}>
              <View style={styles.cabecalho}>
                <ThemedText type="subtitle" style={styles.titulo}>
                  Configurações
                </ThemedText>
                <Pressable onPress={aoFechar} hitSlop={10}>
                  <Ionicons name="close" size={26} color={theme.text} />
                </Pressable>
              </View>

              <ThemedText type="smallBold" themeColor="textSecondary">
                APARÊNCIA
              </ThemedText>
              <View style={styles.seletor}>
                {OPCOES.map((o) => {
                  const ativo = preferencia === o.chave;
                  return (
                    <Pressable
                      key={o.chave}
                      onPress={() => definir(o.chave)}
                      style={[
                        styles.opcao,
                        { borderColor: theme.backgroundSelected },
                        ativo && { backgroundColor: Brand.primary, borderColor: Brand.primary },
                      ]}>
                      <Ionicons
                        name={o.icone}
                        size={20}
                        color={ativo ? Brand.onPrimary : theme.text}
                      />
                      <Text
                        style={[styles.opcaoLabel, { color: ativo ? Brand.onPrimary : theme.text }]}>
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.espaco} />

              <Pressable
                onPress={() => {
                  aoFechar();
                  sair();
                }}
                style={({ pressed }) => [
                  styles.sair,
                  { borderColor: theme.backgroundSelected },
                  pressed && { backgroundColor: theme.backgroundElement },
                ]}>
                <Ionicons name="log-out-outline" size={20} color="#C0341D" />
                <Text style={styles.sairLabel}>Sair</Text>
              </Pressable>

              <ThemedText type="small" themeColor="textSecondary" style={styles.rodape}>
                {Brand.appName} • {Brand.company} • v1.0
              </ThemedText>
            </View>
          </SafeAreaView>
        </GlassSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  painel: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  glass: { flex: 1, borderRadius: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  conteudo: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  titulo: { fontSize: 24 },
  seletor: { gap: Spacing.two },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  opcaoLabel: { fontSize: 16, fontWeight: '600' },
  espaco: { flex: 1 },
  sair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  sairLabel: { fontSize: 16, fontWeight: '700', color: '#C0341D' },
  rodape: { textAlign: 'center', marginTop: Spacing.two },
});
