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
import { useRouter } from 'expo-router';

import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function Login() {
  const router = useRouter();
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

  return (
    <View style={styles.screen}>
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

            {/* Card de login */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Acessar minha conta</Text>

              <View style={styles.campo}>
                <Text style={styles.label}>CPF ou matrícula</Text>
                <TextInput
                  value={identificador}
                  onChangeText={(t) => {
                    setIdentificador(t);
                    setErro('');
                  }}
                  placeholder="Ex.: 000.000.000-00 ou 12345"
                  placeholderTextColor="#9AA0A6"
                  keyboardType="numbers-and-punctuation"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.campo}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  value={senha}
                  onChangeText={(t) => {
                    setSenha(t);
                    setErro('');
                  }}
                  placeholder="Sua senha"
                  placeholderTextColor="#9AA0A6"
                  secureTextEntry
                  style={styles.input}
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
            </View>

            <Text style={styles.footer}>{Brand.company} • uso interno</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.primary },
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
  logoText: { color: Brand.primary, fontWeight: '800', fontSize: 36 },
  appName: { color: Brand.onPrimary, fontSize: 30, fontWeight: '800' },
  tagline: { color: Brand.onPrimary, opacity: 0.9, fontSize: 15 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: Spacing.one },
  campo: { gap: Spacing.one },
  label: { fontSize: 13, fontWeight: '600', color: '#5F6368' },
  input: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 48,
  },
  erro: { color: '#C0341D', fontSize: 13 },
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
