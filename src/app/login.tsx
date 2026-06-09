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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth';

export default function Login() {
  const router = useRouter();
  const theme = useTheme();
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
        colors={[Brand.primary, Brand.primaryDark]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            {/* Marca */}
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>{Brand.company[0]}</Text>
              </View>
              <Text style={styles.appName}>CONTATO</Text>
              <Text style={styles.tagline}>{Brand.tagline}</Text>
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Acesse sua conta
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.cardSub}>
                Entre para enviar e acompanhar suas justificativas de ponto.
              </ThemedText>

              {/* CPF / matrícula */}
              <View
                style={[
                  styles.inputRow,
                  { borderColor: theme.backgroundSelected, backgroundColor: theme.background },
                ]}>
                <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
                <TextInput
                  value={identificador}
                  onChangeText={(t) => {
                    setIdentificador(t);
                    setErro('');
                  }}
                  placeholder="CPF ou matrícula"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numbers-and-punctuation"
                  autoCapitalize="none"
                  style={[styles.input, { color: theme.text }]}
                />
              </View>

              {/* Senha */}
              <View
                style={[
                  styles.inputRow,
                  { borderColor: theme.backgroundSelected, backgroundColor: theme.background },
                ]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
                <TextInput
                  value={senha}
                  onChangeText={(t) => {
                    setSenha(t);
                    setErro('');
                  }}
                  placeholder="Senha"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!verSenha}
                  style={[styles.input, { color: theme.text }]}
                  onSubmitEditing={fazerLogin}
                />
                <Pressable onPress={() => setVerSenha((v) => !v)} hitSlop={8}>
                  <Ionicons
                    name={verSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>

              {erro ? <Text style={styles.erro}>{erro}</Text> : null}

              <Pressable
                onPress={fazerLogin}
                style={({ pressed }) => [styles.botao, pressed && { opacity: 0.9 }]}>
                <Text style={styles.botaoText}>Entrar</Text>
                <Ionicons name="arrow-forward" size={18} color={Brand.onPrimary} />
              </Pressable>

              <Pressable hitSlop={8} style={styles.linkWrap}>
                <Text style={[styles.link, { color: Brand.primary }]}>Esqueci minha senha</Text>
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
  screen: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  brand: { alignItems: 'center', gap: Spacing.two },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: Brand.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 30px rgba(0,0,0,0.25)' } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      },
    }),
  },
  logoText: { color: Brand.accent, fontWeight: '800', fontSize: 44 },
  appName: { color: Brand.onPrimary, fontSize: 30, fontWeight: '800', letterSpacing: 4, marginTop: Spacing.one },
  tagline: { color: Brand.onPrimary, opacity: 0.9, fontSize: 15 },

  card: {
    borderRadius: 22,
    padding: Spacing.four,
    gap: Spacing.three,
    ...Platform.select({
      web: { boxShadow: '0 16px 40px rgba(0,0,0,0.22)' } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        elevation: 10,
      },
    }),
  },
  cardTitle: { fontSize: 24 },
  cardSub: { marginTop: -Spacing.two, marginBottom: Spacing.one },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: Spacing.two },
  erro: { color: '#C0341D', fontSize: 13, fontWeight: '600' },
  botao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Brand.primary,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    marginTop: Spacing.one,
  },
  botaoText: { color: Brand.onPrimary, fontWeight: '700', fontSize: 16 },
  linkWrap: { alignSelf: 'center' },
  link: { fontSize: 14, fontWeight: '600' },
  footer: { color: Brand.onPrimary, opacity: 0.85, textAlign: 'center', fontSize: 12 },
});
