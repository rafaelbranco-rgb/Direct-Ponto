import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';

import { TiltCard } from '@/components/tilt-card';

import { Brand } from '@/constants/brand';
import { Fonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { api, apiAtiva } from '@/data/api';

/**
 * Paleta fixa do login (sempre navy + vidro), independente do tema do app —
 * mantém a tela de entrada consistente e com a identidade da marca.
 */
const C = {
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(160,185,225,0.18)',
  // Campo OPACO (mesma cor da máscara de autofill no global.css) — assim o
  // preenchimento do navegador fica idêntico ao campo, sem o "bloco/sombra".
  field: '#1A2840',
  fieldBorder: 'rgba(160,185,225,0.22)',
  text: '#F1F5FC',
  textDim: 'rgba(225,233,245,0.62)',
  placeholder: 'rgba(225,233,245,0.45)',
  erro: '#FF9A8B',
};

export default function Login() {
  const router = useRouter();
  const { entrar, entrarApi, aplicarSessao, usuario, carregando } = useAuth();

  const [modo, setModo] = useState<'login' | 'primeiro'>('login');
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // 1º acesso (cadastro de senha por CPF, validado no RM)
  const [etapa, setEtapa] = useState<'cpf' | 'senha'>('cpf');
  const [nomeRm, setNomeRm] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirma, setConfirma] = useState('');

  if (carregando) return null;
  if (usuario) return <Redirect href="/" />;

  async function fazerLogin() {
    if (!identificador.trim() || !senha.trim()) {
      setErro('Informe seu CPF/matrícula e a senha.');
      return;
    }
    if (apiAtiva) {
      setEnviando(true);
      setErro('');
      try {
        await entrarApi(identificador.trim(), senha);
        router.replace('/');
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
      } finally {
        setEnviando(false);
      }
      return;
    }
    // Modo demonstração (sem backend).
    entrar({ nome: 'Colaborador', identificador: identificador.trim() });
    router.replace('/');
  }

  async function verificarCpf() {
    if (!identificador.trim()) {
      setErro('Informe seu CPF.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      const r = await api.verificarCpf(identificador.trim());
      setNomeRm(r.nome);
      if (r.precisaDefinirSenha) setEtapa('senha');
      else {
        setErro('Você já tem senha cadastrada. Faça login.');
        setModo('login');
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'CPF não encontrado no RM.');
    } finally {
      setEnviando(false);
    }
  }

  async function definirSenha() {
    if (novaSenha.length < 6) {
      setErro('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirma) {
      setErro('As senhas não conferem.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      const r = await api.definirSenha(identificador.trim(), novaSenha);
      aplicarSessao(r.token, r.usuario);
      router.replace('/');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível definir a senha.');
    } finally {
      setEnviando(false);
    }
  }

  function irParaPrimeiroAcesso() {
    setModo('primeiro');
    setEtapa('cpf');
    setErro('');
    setSenha('');
  }
  function voltarParaLogin() {
    setModo('login');
    setEtapa('cpf');
    setErro('');
    setNovaSenha('');
    setConfirma('');
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
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>
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
              <Text style={styles.pitch}>
                Seu canal direto com o RH para justificar o ponto — converse,
                envie e acompanhe tudo por aqui.
              </Text>
            </View>

            {/* Card de vidro (com tilt 3D sutil no web) */}
            <TiltCard max={4}>
            <View style={styles.card}>
              {modo === 'login' ? (
                <>
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
                    disabled={enviando}
                    style={({ pressed }) => [styles.botao, (pressed || enviando) && styles.botaoPress]}>
                    <Text style={styles.botaoText}>{enviando ? 'Entrando…' : 'Entrar'}</Text>
                    <Ionicons name="arrow-forward" size={18} color={Brand.onPrimary} />
                  </Pressable>

                  <Pressable hitSlop={8} style={styles.linkWrap} onPress={apiAtiva ? irParaPrimeiroAcesso : undefined}>
                    <Text style={styles.link}>{apiAtiva ? 'Primeiro acesso? Cadastrar senha' : 'Esqueci minha senha'}</Text>
                  </Pressable>
                </>
              ) : etapa === 'cpf' ? (
                <>
                  <Text style={styles.cardTitle}>Primeiro acesso</Text>
                  <Text style={styles.cardSub}>Confirme seu CPF para cadastrar sua senha.</Text>

                  <View style={styles.inputRow}>
                    <Ionicons name="card-outline" size={20} color={C.textDim} />
                    <TextInput
                      value={identificador}
                      onChangeText={(t) => {
                        setIdentificador(t);
                        setErro('');
                      }}
                      placeholder="CPF"
                      placeholderTextColor={C.placeholder}
                      keyboardType="numbers-and-punctuation"
                      autoCapitalize="none"
                      style={styles.input}
                      onSubmitEditing={verificarCpf}
                    />
                  </View>

                  {erro ? <Text style={styles.erro}>{erro}</Text> : null}

                  <Pressable
                    onPress={verificarCpf}
                    disabled={enviando}
                    style={({ pressed }) => [styles.botao, (pressed || enviando) && styles.botaoPress]}>
                    <Text style={styles.botaoText}>{enviando ? 'Verificando…' : 'Continuar'}</Text>
                    <Ionicons name="arrow-forward" size={18} color={Brand.onPrimary} />
                  </Pressable>

                  <Pressable hitSlop={8} style={styles.linkWrap} onPress={voltarParaLogin}>
                    <Text style={styles.link}>Voltar para o login</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Olá, {nomeRm.split(' ')[0]}</Text>
                  <Text style={styles.cardSub}>Crie uma senha para acessar o app.</Text>

                  <View style={styles.inputRow}>
                    <Ionicons name="lock-closed-outline" size={20} color={C.textDim} />
                    <TextInput
                      value={novaSenha}
                      onChangeText={(t) => {
                        setNovaSenha(t);
                        setErro('');
                      }}
                      placeholder="Nova senha (mín. 6)"
                      placeholderTextColor={C.placeholder}
                      secureTextEntry={!verSenha}
                      style={styles.input}
                    />
                    <Pressable onPress={() => setVerSenha((v) => !v)} hitSlop={8}>
                      <Ionicons name={verSenha ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.textDim} />
                    </Pressable>
                  </View>

                  <View style={styles.inputRow}>
                    <Ionicons name="lock-closed-outline" size={20} color={C.textDim} />
                    <TextInput
                      value={confirma}
                      onChangeText={(t) => {
                        setConfirma(t);
                        setErro('');
                      }}
                      placeholder="Confirmar senha"
                      placeholderTextColor={C.placeholder}
                      secureTextEntry={!verSenha}
                      style={styles.input}
                      onSubmitEditing={definirSenha}
                    />
                  </View>

                  {erro ? <Text style={styles.erro}>{erro}</Text> : null}

                  <Pressable
                    onPress={definirSenha}
                    disabled={enviando}
                    style={({ pressed }) => [styles.botao, (pressed || enviando) && styles.botaoPress]}>
                    <Text style={styles.botaoText}>{enviando ? 'Salvando…' : 'Definir senha e entrar'}</Text>
                    <Ionicons name="arrow-forward" size={18} color={Brand.onPrimary} />
                  </Pressable>

                  <Pressable hitSlop={8} style={styles.linkWrap} onPress={voltarParaLogin}>
                    <Text style={styles.link}>Voltar para o login</Text>
                  </Pressable>
                </>
              )}
            </View>
            </TiltCard>

            <Text style={styles.footer}>{Brand.companyFull}</Text>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.navy },
  flex: { flex: 1 },
  glow: { position: 'absolute', top: -120, left: -80, width: 360, height: 360, borderRadius: 360 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
  container: {
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
    fontFamily: Fonts.brand,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 8,
    marginTop: Spacing.three,
    // Cinzel já vem em caixa-alta; o leve espaçamento dá ar de wordmark gravado.
    ...Platform.select({ web: { textShadow: '0 2px 12px rgba(0,0,0,0.45)' } as object, default: {} }),
  },
  tagWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  tagDash: { width: 22, height: 1, backgroundColor: 'rgba(242,182,61,0.8)' },
  tagline: { color: Brand.accent, fontSize: 12, letterSpacing: 3, fontWeight: '600', textTransform: 'uppercase' },
  pitch: {
    color: C.textDim,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.two,
  },

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
