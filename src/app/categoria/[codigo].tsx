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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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

  const [mensagens, setMensagens] = useState<Mensagem[]>(conversaInicial.mensagens);
  const [triada, setTriada] = useState(conversaInicial.triada);
  const [passoIdx, setPassoIdx] = useState(0);
  const [texto, setTexto] = useState('');
  const [menuAnexo, setMenuAnexo] = useState(false);

  const seq = useRef(1000);
  const listaRef = useRef<FlatList<Mensagem>>(null);
  const iniciado = useRef(false);

  function nid() {
    seq.current += 1;
    return `x-${seq.current}`;
  }

  // Persiste no store (para a prévia na caixa de entrada).
  useEffect(() => {
    salvarConversa({ categoria: cod, remetente: conversaInicial.remetente, triada, mensagens });
  }, [mensagens, triada]);

  // Inicia a triagem se for um assunto novo (sem mensagens).
  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    if (!conversaInicial.triada && conversaInicial.mensagens.length === 0 && passos.length > 0) {
      setMensagens([
        {
          id: nid(),
          autor: 'ATENDENTE',
          texto: `Olá! Vou abrir seu atendimento de ${categoria?.label ?? 'ponto'}. ${passos[0].pergunta}`,
          horario: agora(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function add(m: Omit<Mensagem, 'id'>) {
    setMensagens((prev) => [...prev, { ...m, id: nid() }]);
  }
  const addColaborador = (texto: string, anexo?: AnexoMsg) =>
    add({ autor: 'COLABORADOR', texto, horario: agora(), anexo, lida: false });
  const addAtendente = (texto: string) => add({ autor: 'ATENDENTE', texto, horario: agora() });
  const addSistema = (texto: string, data: string) => add({ autor: 'SISTEMA', texto, data });

  function finalizarTriagem() {
    addSistema(`Protocolo ${novoProtocolo()} — Atendimento solicitado`, dataHoraAgora());
    addAtendente('Recebemos sua solicitação ✅. Em breve um responsável dará retorno por aqui.');
    setTriada(true);
  }

  function responderTriagem(textoResp?: string, anexo?: AnexoMsg) {
    const passo = passos[passoIdx];
    addColaborador(textoResp ?? '', anexo);

    if (passo.tipo === 'anexo' && !anexo) {
      addAtendente('Para esta etapa, use o 📎 abaixo para anexar o arquivo.');
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
  async function anexarPdf() {
    const res = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (!res.canceled) {
      const a = res.assets[0];
      aoAnexar({ nome: a.name, ehImagem: false });
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
      <View style={{ alignItems: ehColaborador ? 'flex-end' : 'flex-start' }}>
        {mostrarNome && (
          <Text style={[styles.nome, { color: theme.textSecondary }]}>
            {conversaInicial.remetente}
          </Text>
        )}
        <View
          style={[
            styles.balao,
            ehColaborador
              ? { backgroundColor: Brand.primary, borderBottomRightRadius: 4 }
              : { backgroundColor: theme.backgroundElement, borderBottomLeftRadius: 4 },
          ]}>
          {item.anexo &&
            (item.anexo.ehImagem && item.anexo.uri ? (
              <Image source={{ uri: item.anexo.uri }} style={styles.anexoImg} contentFit="cover" />
            ) : (
              <Text style={[styles.anexoArq, { color: ehColaborador ? Brand.onPrimary : theme.text }]}>
                📄 {item.anexo.nome}
              </Text>
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
            {ehColaborador && <Text style={styles.check}>✓✓</Text>}
          </View>
        </View>
      </View>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Text style={styles.titleEmoji}>{categoria?.emoji ?? '📋'}</Text>
            <Text style={styles.titleText} numberOfLines={1}>
              {categoria?.label ?? 'Atendimento'}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
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
          <View style={[styles.menuAnexo, { borderTopColor: theme.backgroundElement }]}>
            <BotaoAnexo emoji="📷" texto="Câmera" onPress={tirarFoto} />
            <BotaoAnexo emoji="🖼️" texto="Galeria" onPress={escolherGaleria} />
            <BotaoAnexo emoji="📄" texto="PDF" onPress={anexarPdf} />
          </View>
        )}

        {/* Composer */}
        <View style={[styles.composer, { borderTopColor: theme.backgroundElement }]}>
          <Pressable onPress={() => setMenuAnexo((v) => !v)} hitSlop={8} style={styles.clip}>
            <Text style={styles.clipEmoji}>📎</Text>
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
            <Text style={styles.enviarSeta}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function BotaoAnexo({ emoji, texto, onPress }: { emoji: string; texto: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.botaoAnexo,
        { borderColor: theme.backgroundElement },
        pressed && { backgroundColor: theme.backgroundElement },
      ]}>
      <Text style={styles.botaoAnexoEmoji}>{emoji}</Text>
      <ThemedText type="small">{texto}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  header: { backgroundColor: Brand.primary },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  back: { paddingRight: Spacing.one },
  backText: { color: Brand.onPrimary, fontSize: 34, lineHeight: 34, fontWeight: '300' },
  titleEmoji: { fontSize: 22 },
  titleText: { color: Brand.onPrimary, fontSize: 20, fontWeight: '700', flex: 1 },

  lista: {
    padding: Spacing.three,
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },

  sistema: { alignItems: 'center', paddingVertical: Spacing.two, gap: 2 },
  sistemaTexto: { fontSize: 13, textAlign: 'center', fontWeight: '600' },
  sistemaData: { fontSize: 12, textAlign: 'center' },

  nome: { fontSize: 12, fontWeight: '600', marginBottom: 2, marginRight: 4 },
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
  check: { fontSize: 11, color: '#8BE9C0' },
  anexoImg: { width: 180, height: 180, borderRadius: 10 },
  anexoArq: { fontSize: 15, fontWeight: '600' },

  menuAnexo: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  botaoAnexo: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    gap: 2,
  },
  botaoAnexoEmoji: { fontSize: 20 },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  clip: { paddingBottom: 8 },
  clipEmoji: { fontSize: 22 },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 40,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  enviar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarSeta: { color: Brand.onPrimary, fontSize: 16, fontWeight: '700' },
});
