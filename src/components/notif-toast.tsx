import { useSyncExternalStore } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  assinarNotificacoes,
  fecharToast,
  getToast,
  versaoNotificacoes,
  versaoServidor,
} from '@/data/notifications';

/** Banner flutuante exibido quando chega uma nova notificação (resposta do atendimento). */
export function NotifToast() {
  const router = useRouter();
  useSyncExternalStore(assinarNotificacoes, versaoNotificacoes, versaoServidor);
  const toast = getToast();

  if (!toast) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <SafeAreaView edges={['top']} pointerEvents="box-none">
        <Animated.View entering={SlideInUp.springify().damping(18)} exiting={FadeOutUp.duration(180)}>
          <Pressable
            style={styles.toast}
            onPress={() => {
              router.push({ pathname: '/categoria/[codigo]', params: { codigo: toast.categoria } });
              fecharToast();
            }}>
            <View style={styles.icone}>
              <Ionicons name="chatbubble-ellipses" size={20} color={Brand.onPrimary} />
            </View>
            <View style={styles.texto}>
              <Text style={styles.titulo} numberOfLines={1}>
                {toast.titulo}
              </Text>
              <Text style={styles.corpo} numberOfLines={2}>
                {toast.corpo}
              </Text>
            </View>
            <Pressable onPress={fecharToast} hitSlop={10}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    width: '92%',
    maxWidth: MaxContentWidth,
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderRadius: 16,
    backgroundColor: Brand.primaryDark,
    borderWidth: 1,
    borderColor: 'rgba(150,176,220,0.25)',
    ...Platform.select({
      web: { boxShadow: '0 12px 30px rgba(0,0,0,0.4)' } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
      },
    }),
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { flex: 1, gap: 1 },
  titulo: { color: Brand.onPrimary, fontWeight: '700', fontSize: 14 },
  corpo: { color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 17 },
});
