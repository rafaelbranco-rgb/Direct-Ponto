import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { GlassSurface } from '@/components/glass';
import { ScreenBackground } from '@/components/screen-bg';
import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth';
import { categoriaPorCodigo } from '@/data/mock';
import {
  agendarRespostaAtendente,
  getConversa,
  novoProtocolo,
  passosTriagem,
  salvarConversa,
  type AnexoMsg,
  type Mensagem,
} from '@/data/chat';
import { api, apiAtiva, ApiError, type MensagemApi } from '@/data/api';
import {
  acharChamadoAberto,
  conectarChat,
  mapMensagem,
  mesclarMensagens,
  parseDataOcorrencia,
  resumoTriagem,
} from '@/data/chat-live';
import { marcarCategoriaLida, pedirPermissaoNotificacao } from '@/data/notifications';
import type { CategoriaCodigo } from '@/data/types';

function doisDigitos(n: number) {
  return String(n).padStart(2, '0');
}
function agora() {
  const d = new Date();
  return `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}
function dataHoraAgora() {
  const d = new Date();
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()} às ${agora()}h`;
}
/** Encurta nomes longos (ex.: "RAFAEL MARTINIANO BARBOSA BRANCO" → "RAFAEL MARTINIANO"). */
function primeiroNome(nomeCompleto: string) {
  const partes = nomeCompleto.trim().split(/\s+/);
  return partes.length <= 2 ? nomeCompleto : `${partes[0]} ${partes[1]}`;
}

export default function ChatCategoria() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const { codigo } = useLocalSearchParams<{ codigo: string }>();

  const categoria = categoriaPorCodigo(codigo ?? '');
  const cod = (categoria?.codigo ?? 'ATRASO') as CategoriaCodigo;
  const nomeColaborador = usuario?.nome ?? 'Você';

  // No modo backend a conversa vem do servidor (carregada no efeito abaixo); o
  // mock só vale na demonstração. Sem isso, categorias com conversa fixa (ex.:
  // ATRASO) abririam "triadas" sem chamado real e o envio não iria ao backend.
  const conversaInicial = apiAtiva
    ? { categoria: cod, remetente: nomeColaborador, triada: false, mensagens: [] as Mensagem[] }
    : getConversa(cod, nomeColaborador);
  const passos = passosTriagem(cod);

  // Mensagem inicial da triagem é calculada já no estado inicial (sem setState
  // dentro de efeito — exigência do React Compiler).
  const [mensagens, setMensagens] = useState<Mensagem[]>(() => {
    if (!conversaInicial.triada && conversaInicial.mensagens.length === 0 && passos.length > 0) {
      return [
        {
          id: 'sys-bem-vindo',
          autor: 'ATENDENTE',
          texto: `Olá! Vou abrir seu atendimento de ${categoria?.label ?? 'ponto'}. ${passos[0].pergunta}`,
          horario: agora(),
        },
      ];
    }
    return conversaInicial.mensagens;
  });
  const [triada, setTriada] = useState(conversaInicial.triada);
  const [passoIdx, setPassoIdx] = useState(0);
  const [texto, setTexto] = useState('');
  const [menuAnexo, setMenuAnexo] = useState(false);
  // Modo backend: id do chamado real (null enquanto a triagem não abriu o chamado).
  const [chamadoId, setChamadoId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Largura da janela: usada para travar o conteúdo na largura visível e evitar
  // que algum overflow horizontal empurre o composer para fora da tela.
  const { width: larguraJanela } = useWindowDimensions();

  const seq = useRef(1000);
  const listaRef = useRef<FlatList<Mensagem>>(null);
  // Respostas estruturadas da triagem (viram os campos do chamado).
  const respostasRef = useRef<Record<string, string>>({});
  const anexoTriagemRef = useRef<AnexoMsg | null>(null);

  function nid() {
    seq.current += 1;
    return `x-${seq.current}`;
  }

  // Persiste no mock só no modo demonstração (no backend a fonte é o servidor).
  useEffect(() => {
    if (apiAtiva) return;
    salvarConversa({ categoria: cod, remetente: conversaInicial.remetente, triada, mensagens });
  }, [cod, conversaInicial.remetente, mensagens, triada]);

  // Recebe uma mensagem do backend (via socket ou retorno de envio), sem duplicar.
  const receber = useCallback((m: MensagemApi) => {
    setMensagens((prev) => mesclarMensagens(prev, [mapMensagem(m)]));
  }, []);

  // Ao abrir a tela no modo backend, busca um chamado já aberto desta categoria.
  useEffect(() => {
    if (!apiAtiva) return;
    let vivo = true;
    acharChamadoAberto(cod)
      .then(async (c) => {
        if (!vivo || !c) return;
        const det = await api.detalhe(c.id);
        if (!vivo) return;
        setChamadoId(c.id);
        setTriada(true);
        setMensagens((det.mensagens ?? []).map(mapMensagem));
      })
      .catch(() => {
        /* sem chamado aberto → a triagem segue normalmente */
      });
    return () => {
      vivo = false;
    };
  }, [cod]);

  // Conecta na sala do chamado para receber respostas do atendente em tempo real.
  useEffect(() => {
    if (!apiAtiva || !chamadoId) return;
    return conectarChat(chamadoId, receber);
  }, [chamadoId, receber]);

  // Ao abrir o atendimento, marca as notificações desta categoria como lidas.
  useEffect(() => {
    marcarCategoriaLida(cod);
  }, [cod]);

  function add(m: Omit<Mensagem, 'id'>) {
    setMensagens((prev) => [...prev, { ...m, id: nid() }]);
  }
  const addColaborador = (texto: string, anexo?: AnexoMsg) =>
    add({ autor: 'COLABORADOR', texto, horario: agora(), anexo, lida: false });
  const addAtendente = (texto: string) => add({ autor: 'ATENDENTE', texto, horario: agora() });
  const addSistema = (texto: string, data: string) => add({ autor: 'SISTEMA', texto, data });

  /** No backend: abre o chamado de verdade e envia o resumo da triagem + anexo. */
  async function abrirChamadoBackend() {
    const r = respostasRef.current;
    try {
      setEnviando(true);
      const chamado = await api.abrirChamado({
        categoria: cod,
        dataOcorrencia: parseDataOcorrencia(r.data),
        horarioProposto: r.horario || undefined,
        descricao: r.descricao || undefined,
      });
      setChamadoId(chamado.id);
      setTriada(true);
      setMensagens((chamado.mensagens ?? []).map(mapMensagem));

      const resumo = resumoTriagem(r);
      if (resumo) receber(await api.enviarMensagem(chamado.id, resumo));
      const anexo = anexoTriagemRef.current;
      if (anexo) {
        receber(await api.enviarMensagem(chamado.id, '', { nome: anexo.nome, ehImagem: anexo.ehImagem }));
      }
    } catch (e) {
      addAtendente(
        e instanceof ApiError
          ? `Não consegui abrir o atendimento: ${e.message}`
          : 'Falha ao abrir o atendimento. Verifique a conexão e tente novamente.',
      );
    } finally {
      setEnviando(false);
    }
  }

  function finalizarTriagem() {
    if (apiAtiva) {
      abrirChamadoBackend();
      return;
    }
    addSistema(`Protocolo ${novoProtocolo()} — Atendimento solicitado`, dataHoraAgora());
    addAtendente('Recebemos sua solicitação. Em breve um responsável dará retorno por aqui.');
    setTriada(true);
    // Simula o atendimento respondendo em seguida → gera notificação.
    agendarRespostaAtendente(cod, categoria?.label ?? 'Ponto');
  }

  function responderTriagem(textoResp?: string, anexo?: AnexoMsg) {
    const passo = passos[passoIdx];
    addColaborador(textoResp ?? '', anexo);

    if (passo.tipo === 'anexo' && !anexo) {
      addAtendente('Para esta etapa, use o botão de anexar (clipe) abaixo.');
      return;
    }
    if (passo.tipo === 'texto' && !textoResp) return;

    // Guarda a resposta para virar campo do chamado / resumo no backend.
    if (passo.tipo === 'anexo' && anexo) anexoTriagemRef.current = anexo;
    else respostasRef.current[passo.chave] = textoResp ?? '';

    const prox = passoIdx + 1;
    if (prox < passos.length) {
      setPassoIdx(prox);
      addAtendente(passos[prox].pergunta);
    } else {
      finalizarTriagem();
    }
  }

  /** Envia uma mensagem ao backend e exibe o retorno (o socket também ecoa). */
  async function enviarApi(t: string, anexo?: AnexoMsg) {
    if (!chamadoId) return;
    try {
      setEnviando(true);
      const m = await api.enviarMensagem(
        chamadoId,
        t,
        anexo ? { nome: anexo.nome, ehImagem: anexo.ehImagem } : undefined,
      );
      receber(m);
    } catch (e) {
      addAtendente(
        e instanceof ApiError ? `Não consegui enviar: ${e.message}` : 'Falha ao enviar a mensagem.',
      );
    } finally {
      setEnviando(false);
    }
  }

  function enviar() {
    const t = texto.trim();
    if (!t) return;
    pedirPermissaoNotificacao(); // gesto do usuário — momento bom para pedir permissão
    setTexto('');
    setMenuAnexo(false);
    if (!triada) {
      responderTriagem(t);
    } else if (apiAtiva) {
      enviarApi(t);
    } else {
      addColaborador(t);
      agendarRespostaAtendente(cod, categoria?.label ?? 'Ponto');
    }
  }

  function aoAnexar(anexo: AnexoMsg) {
    setMenuAnexo(false);
    if (!triada) responderTriagem(undefined, anexo);
    else if (apiAtiva) enviarApi('', anexo);
    else addColaborador('', anexo);
  }

  async function tirarFoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled) {
      const a = res.assets[0];
      aoAnexar({ nome: a.fileName ?? 'foto.jpg', ehImagem: true, uri: a.uri });
    }
  }
  async function escolherGaleria() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled) {
      const a = res.assets[0];
      aoAnexar({ nome: a.fileName ?? 'imagem.jpg', ehImagem: true, uri: a.uri });
    }
  }
  async function anexarDocumento() {
    const res = await DocumentPicker.getDocumentAsync({
      // Documentos em geral (não só PDF): PDF, Word, Excel, texto, imagens.
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/*',
      ],
      copyToCacheDirectory: true,
    });
    if (!res.canceled) {
      const a = res.assets[0];
      const ehImagem = (a.mimeType ?? '').startsWith('image/');
      aoAnexar({ nome: a.name, ehImagem, uri: ehImagem ? a.uri : undefined });
    }
  }

  function renderMensagem(item: Mensagem, index: number) {
    if (item.autor === 'SISTEMA') {
      return (
        <View style={styles.sistema}>
          <Text style={[styles.sistemaTexto, { color: theme.textSecondary }]}>{item.texto}</Text>
          {item.data && (
            <Text style={[styles.sistemaData, { color: theme.textSecondary }]}>{item.data}</Text>
          )}
        </View>
      );
    }

    const ehColaborador = item.autor === 'COLABORADOR';
    const anterior = mensagens[index - 1];
    const mostrarNome = ehColaborador && (!anterior || anterior.autor !== 'COLABORADOR');

    return (
      <View style={[styles.linha, { alignItems: ehColaborador ? 'flex-end' : 'flex-start' }]}>
        {mostrarNome && (
          <Text style={[styles.nome, { color: theme.textSecondary }]} numberOfLines={1}>
            {primeiroNome(conversaInicial.remetente)}
          </Text>
        )}
        <View
          style={[
            styles.balao,
            ehColaborador
              ? { backgroundColor: Brand.primary, borderBottomRightRadius: 4 }
              : {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderBottomLeftRadius: 4,
                },
          ]}>
          {item.anexo &&
            (item.anexo.ehImagem && item.anexo.uri ? (
              <Image source={{ uri: item.anexo.uri }} style={styles.anexoImg} contentFit="cover" />
            ) : (
              <View style={styles.anexoArq}>
                <Ionicons
                  name="document-outline"
                  size={18}
                  color={ehColaborador ? Brand.onPrimary : theme.text}
                />
                <Text
                  style={[styles.anexoArqTxt, { color: ehColaborador ? Brand.onPrimary : theme.text }]}>
                  {item.anexo.nome}
                </Text>
              </View>
            ))}
          {!!item.texto && (
            <Text style={[styles.balaoTexto, { color: ehColaborador ? Brand.onPrimary : theme.text }]}>
              {item.texto}
            </Text>
          )}
          <View style={styles.balaoRodape}>
            <Text
              style={[
                styles.hora,
                { color: ehColaborador ? 'rgba(255,255,255,0.8)' : theme.textSecondary },
              ]}>
              {item.horario}
            </Text>
            {ehColaborador && <Ionicons name="checkmark-done" size={14} color="#8BE9C0" />}
          </View>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={styles.screen}
      entering={FadeInRight.springify().damping(16).stiffness(110).mass(0.9)}>
      <ScreenBackground />

      <View style={styles.header}>
        <LinearGradient
          colors={Brand.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={Brand.onPrimary} />
              </Pressable>
              <View style={styles.headerCenter}>
                <Text style={styles.titleText} numberOfLines={1}>
                  {categoria?.label ?? 'Atendimento'}
                </Text>
                <Text style={styles.subtitleText} numberOfLines={1}>
                  Justificativa de ponto
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        {/* Fio dourado da marca (View sólida, sempre visível) */}
        <View style={styles.goldLine} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.centro, { maxWidth: Math.min(larguraJanela, MaxContentWidth) }]}>
          <FlatList
            ref={listaRef}
            data={mensagens}
            keyExtractor={(m) => m.id}
            style={styles.flex}
            contentContainerStyle={styles.lista}
            renderItem={({ item, index }) => renderMensagem(item, index)}
            onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Menu de anexo */}
          {menuAnexo && (
            <View style={styles.menuWrap}>
              <GlassSurface style={styles.menuAnexo}>
                <BotaoAnexo icone="camera-outline" texto="Câmera" onPress={tirarFoto} />
                <BotaoAnexo icone="images-outline" texto="Galeria" onPress={escolherGaleria} />
                <BotaoAnexo icone="document-outline" texto="Documento" onPress={anexarDocumento} />
              </GlassSurface>
            </View>
          )}

          {/* Composer de vidro */}
          <View style={[styles.composerWrap, { paddingBottom: Spacing.three + insets.bottom }]}>
            <GlassSurface style={styles.composer}>
              <Pressable onPress={() => setMenuAnexo((v) => !v)} hitSlop={8} style={styles.clip}>
                <Ionicons name="add-circle-outline" size={24} color={theme.textSecondary} />
              </Pressable>
              <View style={styles.inputWrap}>
                <TextInput
                  value={texto}
                  onChangeText={setTexto}
                  placeholder="Mensagem"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text }]}
                  returnKeyType="send"
                  onSubmitEditing={enviar}
                />
              </View>
              <Pressable
                onPress={enviar}
                disabled={!texto.trim() || enviando}
                style={[
                  styles.enviar,
                  { backgroundColor: Brand.primary, opacity: texto.trim() && !enviando ? 1 : 0.45 },
                ]}>
                <Ionicons name="send" size={16} color={Brand.onPrimary} />
              </Pressable>
            </GlassSurface>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

function BotaoAnexo({
  icone,
  texto,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  texto: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.botaoAnexo,
        { borderColor: theme.backgroundSelected },
        pressed && { backgroundColor: theme.backgroundElement },
      ]}>
      <Ionicons name={icone} size={22} color={Brand.primary} />
      <ThemedText type="small">{texto}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },

  header: {
    // Barra plana (cantos retos); o fio dourado é uma View sólida embaixo.
    ...Platform.select({
      web: { boxShadow: '0 4px 14px rgba(11,18,32,0.18)' } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      },
    }),
  },
  goldLine: { height: 3, backgroundColor: Brand.accent },
  headerRow: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 56,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
  },
  backBtn: {
    position: 'absolute',
    left: Spacing.three,
    top: 0,
    bottom: 0,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center', gap: 2 },
  titleText: {
    color: Brand.onPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    textAlign: 'center',
  },

  // Coluna central travada na largura visível (maxWidth aplicado inline com a
  // largura da janela) para nenhum overflow empurrar o composer para fora.
  centro: { flex: 1, width: '100%', alignSelf: 'center', overflow: 'hidden' },
  lista: {
    padding: Spacing.three,
    gap: Spacing.two,
    // Ancora as mensagens embaixo (espaço vazio fica no topo, como num chat).
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  linha: { width: '100%' },

  sistema: { alignItems: 'center', paddingVertical: Spacing.two, gap: 2 },
  sistemaTexto: { fontSize: 13, textAlign: 'center', fontWeight: '600' },
  sistemaData: { fontSize: 12, textAlign: 'center' },

  nome: { fontSize: 12, fontWeight: '600', marginBottom: 2, marginRight: 4, maxWidth: '82%' },
  balao: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 4,
  },
  balaoTexto: { fontSize: 16, lineHeight: 22 },
  balaoRodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  hora: { fontSize: 11 },
  anexoImg: { width: 180, height: 180, borderRadius: 10 },
  anexoArq: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  anexoArqTxt: { fontSize: 15, fontWeight: '600' },

  menuWrap: { paddingHorizontal: Spacing.three },
  menuAnexo: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  botaoAnexo: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    gap: 2,
  },

  composerWrap: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.two,
    paddingRight: Spacing.half,
    paddingVertical: Spacing.half,
    borderRadius: 22,
  },
  clip: {
    width: 30,
    height: 30,
    marginRight: Spacing.one,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  input: {
    width: '100%',
    height: 34,
    fontSize: 15,
    paddingVertical: 0,
    paddingHorizontal: 4,
    textAlignVertical: 'center',
    ...Platform.select({ web: { outlineStyle: 'none' } as object, default: {} }),
  },
  enviar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginLeft: Spacing.one,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
