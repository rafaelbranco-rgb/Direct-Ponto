import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { GlassSurface } from '@/components/glass';
import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemePref, type Preferencia } from '@/context/theme-pref';
import { useAuth } from '@/context/auth';

const TEMAS: { chave: Preferencia; label: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { chave: 'system', label: 'Sistema', icone: 'phone-portrait-outline' },
  { chave: 'light', label: 'Claro', icone: 'sunny-outline' },
  { chave: 'dark', label: 'Escuro', icone: 'moon-outline' },
];

type Vista = 'menu' | 'config';

const EASING = Easing.bezier(0.2, 0.84, 0.2, 1);

export function SettingsDrawer({ visivel, aoFechar }: { visivel: boolean; aoFechar: () => void }) {
  const { width } = useWindowDimensions();
  const largura = Math.min(330, width * 0.85);
  const theme = useTheme();
  const { preferencia, definir } = useThemePref();
  const { usuario, sair } = useAuth();

  const [vista, setVista] = useState<Vista>('menu');
  const progresso = useSharedValue(0);

  useEffect(() => {
    progresso.value = withTiming(
      visivel ? 1 : 0,
      { duration: visivel ? 260 : 220, easing: EASING },
      (fim) => {
        // Ao terminar de fechar, reseta a subtela para a próxima abertura.
        if (fim && !visivel) runOnJS(setVista)('menu');
      },
    );
  }, [visivel, progresso]);

  const estiloBackdrop = useAnimatedStyle(() => ({ opacity: progresso.value }));
  // Abre pela DIREITA: fora da tela = +largura; aberto = 0.
  const estiloPainel = useAnimatedStyle(
    () => ({ transform: [{ translateX: interpolate(progresso.value, [0, 1], [largura, 0]) }] }),
    [largura],
  );

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: visivel ? 'auto' : 'none' }]}>
      <Animated.View style={[styles.backdrop, estiloBackdrop]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} />
      </Animated.View>

      <Animated.View style={[styles.painel, { width: largura }, estiloPainel]}>
        <GlassSurface forte style={styles.glass}>
          <SafeAreaView edges={['top', 'bottom']} style={styles.flex}>
            <View style={styles.conteudo}>
              {vista === 'menu' ? (
                <>
                  {/* Perfil */}
                  <View style={styles.perfil}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarTxt}>{Brand.company[0]}</Text>
                    </View>
                    <View style={styles.flex}>
                      <ThemedText type="smallBold" numberOfLines={1}>
                        {usuario?.nome ?? 'Colaborador'}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                        {usuario?.identificador ?? ''}
                      </ThemedText>
                    </View>
                    <Pressable onPress={aoFechar} hitSlop={10}>
                      <Ionicons name="close" size={26} color={theme.text} />
                    </Pressable>
                  </View>

                  <View style={styles.divisor} />

                  <ItemMenu
                    icone="settings-outline"
                    label="Configurações"
                    onPress={() => setVista('config')}
                    chevron
                  />

                  <View style={styles.espaco} />

                  <ItemMenu icone="log-out-outline" label="Sair" perigo onPress={() => { aoFechar(); sair(); }} />

                  <ThemedText type="small" themeColor="textSecondary" style={styles.rodape}>
                    {Brand.appName} • v1.0
                  </ThemedText>
                </>
              ) : (
                <>
                  {/* Cabeçalho da subtela */}
                  <View style={styles.subHeader}>
                    <Pressable onPress={() => setVista('menu')} hitSlop={10}>
                      <Ionicons name="chevron-back" size={26} color={theme.text} />
                    </Pressable>
                    <ThemedText type="subtitle" style={styles.titulo}>
                      Configurações
                    </ThemedText>
                  </View>

                  <ThemedText type="smallBold" themeColor="textSecondary">
                    APARÊNCIA
                  </ThemedText>
                  <View style={styles.seletor}>
                    {TEMAS.map((o) => {
                      const ativo = preferencia === o.chave;
                      return (
                        <Pressable
                          key={o.chave}
                          onPress={() => definir(o.chave)}
                          style={[
                            styles.tema,
                            { borderColor: theme.backgroundSelected },
                            ativo && { backgroundColor: Brand.primary, borderColor: Brand.primary },
                          ]}>
                          <Ionicons name={o.icone} size={20} color={ativo ? Brand.onPrimary : theme.text} />
                          <Text style={[styles.temaLabel, { color: ativo ? Brand.onPrimary : theme.text }]}>
                            {o.label}
                          </Text>
                          {ativo && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color={Brand.onPrimary}
                              style={styles.check}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.espaco} />
                  <ThemedText type="small" themeColor="textSecondary" style={styles.rodape}>
                    {Brand.appName} • v1.0
                  </ThemedText>
                </>
              )}
            </View>
          </SafeAreaView>
        </GlassSurface>
      </Animated.View>
    </View>
  );
}

function ItemMenu({
  icone,
  label,
  onPress,
  chevron,
  perigo,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  chevron?: boolean;
  perigo?: boolean;
}) {
  const theme = useTheme();
  const cor = perigo ? '#C0341D' : theme.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { borderColor: theme.backgroundSelected },
        pressed && { backgroundColor: theme.backgroundElement },
      ]}>
      <Ionicons name={icone} size={22} color={perigo ? '#C0341D' : Brand.primary} />
      <Text style={[styles.itemLabel, { color: cor }]}>{label}</Text>
      {chevron && <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  painel: { position: 'absolute', top: 0, bottom: 0, right: 0 },
  glass: { flex: 1, borderRadius: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  conteudo: { flex: 1, padding: Spacing.four, gap: Spacing.three },

  perfil: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: Brand.accent, fontWeight: '800', fontSize: 20 },
  divisor: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(127,127,127,0.25)' },

  subHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.two },
  titulo: { fontSize: 24 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: '600' },

  seletor: { gap: Spacing.two },
  tema: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  temaLabel: { fontSize: 16, fontWeight: '600', flex: 1 },
  check: {},

  espaco: { flex: 1 },
  rodape: { textAlign: 'center', marginTop: Spacing.two },
});
