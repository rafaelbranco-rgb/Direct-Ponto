import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

/**
 * Paleta fixa do login (sempre navy + vidro), independente do tema do app —
 * mantém a tela de entrada consistente e com a identidade da marca.
 */
const C = {
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(160,185,225,0.18)',
  field: 'rgba(255,255,255,0.05)',
  fieldBorder: 'rgba(160,185,225,0.20)',
  text: '#F1F5FC',
  textDim: 'rgba(225,233,245,0.62)',
  placeholder: 'rgba(225,233,245,0.45)',
  erro: '#FF9A8B',
};

export default function Login() {
  const router = useRouter();
  const { entrar } = useAuth();

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');

  function fazerLogin() {
    if (!identificador.trim() || !senha.trim()) {
      setErro('Informe seu CPF/matrícula e a senha.');
      return;
    }
    // TODO: trocar por chamada real ao backend (RF-01). Hoje aceita qualquer valor.
    entrar({ nome: 'Colaborador', identificador: identificador.trim() });
    router.replace('/');
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={Brand.loginGradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
      />
      {/* Brilho diagonal sutil, dá profundidade sem poluir */}
      <LinearGradient
        colors={['rgba(43,87,173,0.30)', 'transparent']}
        style={styles.glow}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            {/* Marca */}
            <View style={styles.brand}>
              <Image
                source={require('@/assets/images/logo-contato.png')}
                style={styles.emblema}
                contentFit="contain"
              />
              <Text style={styles.appName}>CONTATO</Text>
              <View style={styles.tagWrap}>
                <View style={styles.tagDash} />
                <Text style={styles.tagline}>{Brand.tagline}</Text>
                <View style={styles.tagDash} />
              </View>
            </View>

            {/* Card de vidro */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Acesse sua conta</Text>
              <Text style={styles.cardSub}>
                Entre para enviar e acompanhar suas justificativas de ponto.
              </Text>

              {/* CPF / matrícula */}
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={20} color={C.textDim} />
                <TextInput
                  value={identificador}
                  onChangeText={(t) => {
                    setIdentificador(t);
                    setErro('');
                  }}
                  placeholder="CPF ou matrícula"
                  placeholderTextColor={C.placeholder}
                  keyboardType="numbers-and-punctuation"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              {/* Senha */}
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={20} color={C.textDim} />
                <TextInput
                  value={senha}
                  onChangeText={(t) => {
                    setSenha(t);
                    setErro('');
                  }}
                  placeholder="Senha"
                  placeholderTextColor={C.placeholder}
                  secureTextEntry={!verSenha}
                  style={styles.input}
                  onSubmitEditing={fazerLogin}
                />
                <Pressable onPress={() => setVerSenha((v) => !v)} hitSlop={8}>
                  <Ionicons
                    name={verSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={C.textDim}
                  />
                </Pressable>
              </View>

              {erro ? <Text style={styles.erro}>{erro}</Text> : null}

              <Pressable
                onPress={fazerLogin}
                style={({ pressed }) => [styles.botao, pressed && styles.botaoPress]}>
                <Text style={styles.botaoText}>Entrar</Text>
                <Ionicons name="arrow-forward" size={18} color={Brand.onPrimary} />
              </Pressable>

              <Pressable hitSlop={8} style={styles.linkWrap}>
                <Text style={styles.link}>Esqueci minha senha</Text>
              </Pressable>
            </View>

            <Text style={styles.footer}>{Brand.companyFull}</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.navy },
  flex: { flex: 1 },
  glow: { position: 'absolute', top: -120, left: -80, width: 360, height: 360, borderRadius: 360 },
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  brand: { alignItems: 'center', gap: Spacing.two },
  emblema: {
    width: 132,
    height: 107,
    ...Platform.select({
      web: { filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.4))' } as object,
      default: {},
    }),
  },
  appName: {
    color: Brand.onPrimary,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 6,
    marginTop: Spacing.two,
  },
  tagWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tagDash: { width: 18, height: 1, backgroundColor: 'rgba(225,162,44,0.6)' },
  tagline: { color: C.textDim, fontSize: 13, letterSpacing: 1 },

  card: {
    borderRadius: 22,
    padding: Spacing.four,
    gap: Spacing.three,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    ...Platform.select({
      web: { boxShadow: '0 18px 44px rgba(0,0,0,0.32)' } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.32,
        shadowRadius: 26,
        shadowOffset: { width: 0, height: 14 },
        elevation: 12,
      },
    }),
  },
  cardTitle: { color: C.text, fontSize: 22, fontWeight: '700' },
  cardSub: { color: C.textDim, fontSize: 14, lineHeight: 20, marginTop: -Spacing.two },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: C.fieldBorder,
    backgroundColor: C.field,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 16, color: C.text, paddingVertical: Spacing.two },
  erro: { color: C.erro, fontSize: 13, fontWeight: '600' },
  botao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Brand.primary,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    marginTop: Spacing.one,
    ...Platform.select({
      web: { boxShadow: '0 8px 22px rgba(43,87,173,0.45)' } as object,
      default: {
        shadowColor: Brand.primary,
        shadowOpacity: 0.45,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      },
    }),
  },
  botaoPress: { opacity: 0.9 },
  botaoText: { color: Brand.onPrimary, fontWeight: '700', fontSize: 16 },
  linkWrap: { alignSelf: 'center' },
  link: { color: '#9DBBF0', fontSize: 14, fontWeight: '600' },
  footer: { color: C.textDim, textAlign: 'center', fontSize: 12 },
});
