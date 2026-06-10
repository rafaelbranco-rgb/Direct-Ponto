import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { BrandHeader } from '@/components/brand-header';
import { GlassSurface } from '@/components/glass';
import { ScreenBackground } from '@/components/screen-bg';
import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth';
import { categoriaPorCodigo } from '@/data/mock';
import {
  getConversa,
  novoProtocolo,
  passosTriagem,
  salvarConversa,
  type AnexoMsg,
  type Mensagem,
} from '@/data/chat';
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
  const { usuario } = useAuth();
  const { codigo } = useLocalSearchParams<{ codigo: string }>();

  const categoria = categoriaPorCodigo(codigo ?? '');
  const cod = (categoria?.codigo ?? 'ATRASO') as CategoriaCodigo;
  const nomeColaborador = usuario?.nome ?? 'Você';

  const conversaInicial = getConversa(cod, nomeColaborador);
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

  const seq = useRef(1000);
  const listaRef = useRef<FlatList<Mensagem>>(null);

  function nid() {
    seq.current += 1;
    return `x-${seq.current}`;
  }

  useEffect(() => {
    salvarConversa({ categoria: cod, remetente: conversaInicial.remetente, triada, mensagens });
  }, [cod, conversaInicial.remetente, mensagens, triada]);

  function add(m: Omit<Mensagem, 'id'>) {
    setMensagens((prev) => [...prev, { ...m, id: nid() }]);
  }
  const addColaborador = (texto: string, anexo?: AnexoMsg) =>
    add({ autor: 'COLABORADOR', texto, horario: agora(), anexo, lida: false });
  const addAtendente = (texto: string) => add({ autor: 'ATENDENTE', texto, horario: agora() });
  const addSistema = (texto: string, data: string) => add({ autor: 'SISTEMA', texto, data });

  function finalizarTriagem() {
    addSistema(`Protocolo ${novoProtocolo()} — Atendimento solicitado`, dataHoraAgora());
    addAtendente('Recebemos sua solicitação. Em breve um responsável dará retorno por aqui.');
    setTriada(true);
  }

  function responderTriagem(textoResp?: string, anexo?: AnexoMsg) {
    const passo = passos[passoIdx];
    addColaborador(textoResp ?? '', anexo);

    if (passo.tipo === 'anexo' && !anexo) {
      addAtendente('Para esta etapa, use o botão de anexar (clipe) abaixo.');
      return;
    }
    if (passo.tipo === 'texto' && !textoResp) return;

    const prox = passoIdx + 1;
    if (prox < passos.length) {
      setPassoIdx(prox);
      addAtendente(passos[prox].pergunta);
    } else {
      finalizarTriagem();
    }
  }

  function enviar() {
    const t = texto.trim();
    if (!t) return;
    setTexto('');
    setMenuAnexo(false);
    if (!triada) responderTriagem(t);
    else addColaborador(t);
  }

  function aoAnexar(anexo: AnexoMsg) {
    setMenuAnexo(false);
    if (!triada) responderTriagem(undefined, anexo);
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
    <View style={styles.screen}>
      <ScreenBackground />

      <BrandHeader>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={Brand.onPrimary} />
          </Pressable>
          <Ionicons
            name={(categoria?.icone ?? 'chatbubble-outline') as keyof typeof Ionicons.glyphMap}
            size={22}
            color={Brand.onPrimary}
          />
          <Text style={styles.titleText} numberOfLines={1}>
            {categoria?.label ?? 'Atendimento'}
          </Text>
        </View>
      </BrandHeader>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.centro}>
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
          <View style={styles.composerWrap}>
            <GlassSurface style={styles.composer}>
              <Pressable onPress={() => setMenuAnexo((v) => !v)} hitSlop={8} style={styles.clip}>
                <Ionicons name="attach" size={22} color={theme.textSecondary} />
              </Pressable>
              <TextInput
                value={texto}
                onChangeText={setTexto}
                placeholder="Mensagem"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                multiline
                onSubmitEditing={enviar}
              />
              <Pressable
                onPress={enviar}
                disabled={!texto.trim()}
                style={[styles.enviar, { backgroundColor: Brand.primary, opacity: texto.trim() ? 1 : 0.4 }]}>
                <Ionicons name="send" size={18} color={Brand.onPrimary} />
              </Pressable>
            </GlassSurface>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  titleText: { color: Brand.onPrimary, fontSize: 20, fontWeight: '700', flex: 1 },

  // Wrapper central único (evita overflow à direita no web ao centralizar
  // cada elemento separadamente).
  centro: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
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
    paddingBottom: Spacing.three,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 28,
  },
  clip: { paddingBottom: 8, paddingLeft: 4 },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 40,
    paddingVertical: Spacing.two,
  },
  enviar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
