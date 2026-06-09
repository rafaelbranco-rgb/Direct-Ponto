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
import { useRouter } from 'expo-router';

import { GlassSurface } from '@/components/glass';
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

  const inputStyle = [
    styles.input,
    { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(127,127,127,0.10)' },
  ];

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[Brand.primary, Brand.primaryDark]}
        style={StyleSheet.absoluteFill}
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
              <View style={styles.logo}>
                <Text style={styles.logoText}>{Brand.company[0]}</Text>
              </View>
              <Text style={styles.appName}>{Brand.appName}</Text>
              <Text style={styles.tagline}>{Brand.tagline}</Text>
            </View>

            {/* Card de login (vidro) */}
            <GlassSurface forte style={styles.card}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Acessar minha conta
              </ThemedText>

              <View style={styles.campo}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  CPF ou matrícula
                </ThemedText>
                <TextInput
                  value={identificador}
                  onChangeText={(t) => {
                    setIdentificador(t);
                    setErro('');
                  }}
                  placeholder="Ex.: 000.000.000-00 ou 12345"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numbers-and-punctuation"
                  autoCapitalize="none"
                  style={inputStyle}
                />
              </View>

              <View style={styles.campo}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Senha
                </ThemedText>
                <TextInput
                  value={senha}
                  onChangeText={(t) => {
                    setSenha(t);
                    setErro('');
                  }}
                  placeholder="Sua senha"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  style={inputStyle}
                  onSubmitEditing={fazerLogin}
                />
              </View>

              {erro ? <Text style={styles.erro}>{erro}</Text> : null}

              <Pressable
                onPress={fazerLogin}
                style={({ pressed }) => [styles.botao, pressed && { opacity: 0.85 }]}>
                <Text style={styles.botaoText}>Entrar</Text>
              </Pressable>

              <Pressable hitSlop={8}>
                <Text style={styles.link}>Esqueci minha senha</Text>
              </Pressable>
            </GlassSurface>

            <Text style={styles.footer}>{Brand.companyFull} • uso interno</Text>
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
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: Brand.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: Brand.accent, fontWeight: '800', fontSize: 38 },
  appName: { color: Brand.onPrimary, fontSize: 30, fontWeight: '800' },
  tagline: { color: Brand.onPrimary, opacity: 0.9, fontSize: 15 },
  card: { padding: Spacing.four, gap: Spacing.three },
  cardTitle: { fontSize: 22, marginBottom: Spacing.one },
  campo: { gap: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    minHeight: 48,
  },
  erro: { color: '#FFD7D2', fontSize: 13, fontWeight: '600' },
  botao: {
    backgroundColor: Brand.primary,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  botaoText: { color: Brand.onPrimary, fontWeight: '700', fontSize: 16 },
  link: { color: Brand.primary, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  footer: { color: Brand.onPrimary, opacity: 0.8, textAlign: 'center', fontSize: 12 },
});
