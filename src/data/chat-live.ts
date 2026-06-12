/**
 * Ponte do chat com o backend (Contato API).
 *
 * O app é um chat de atendimento: cada chamado vira uma sala no WebSocket
 * (`chamado:<id>`, namespace `/chat`). Aqui ficam os utilitários que ligam a
 * tela de conversa ao backend — mapear mensagens, conectar o socket, achar o
 * chamado aberto de uma categoria e preparar o payload de abertura.
 *
 * Só é usado quando `apiAtiva` é true (EXPO_PUBLIC_API_URL definido). No modo
 * demonstração a tela continua usando o mock de `chat.ts`.
 */
import { io, type Socket } from 'socket.io-client';

import { api, getToken, type ChamadoApi, type MensagemApi } from './api';
import type { Mensagem } from './chat';
import type { CategoriaCodigo } from './types';

const BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

/** Status que indicam um chamado já encerrado (some da conversa "ativa"). */
const RESOLVIDO = ['APROVADO', 'RECUSADO'];

function doisDigitos(n: number) {
  return String(n).padStart(2, '0');
}

/** Formata o ISO de criação como "dd/mm/aaaa às HH:MMh" (linha de sistema). */
export function formatDataSistema(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()} às ${doisDigitos(
    d.getHours(),
  )}:${doisDigitos(d.getMinutes())}h`;
}

/** Converte uma mensagem do backend para o formato exibido na tela. */
export function mapMensagem(m: MensagemApi): Mensagem {
  return {
    id: m.id,
    autor: m.autor,
    texto: m.texto ?? '',
    horario: m.autor === 'SISTEMA' ? undefined : (m.horario ?? ''),
    data: m.autor === 'SISTEMA' ? formatDataSistema(m.criadoEm) : undefined,
    anexo: m.anexoNome ? { nome: m.anexoNome, ehImagem: !!m.anexoEhImagem } : undefined,
    lida: m.autor === 'COLABORADOR' ? true : undefined,
  };
}

/** Acrescenta mensagens novas a uma lista, ignorando ids já presentes. */
export function mesclarMensagens(atual: Mensagem[], novas: Mensagem[]): Mensagem[] {
  const ids = new Set(atual.map((m) => m.id));
  const extras = novas.filter((m) => !ids.has(m.id));
  return extras.length ? [...atual, ...extras] : atual;
}

/** Acha o chamado aberto (não resolvido) mais recente de uma categoria. */
export async function acharChamadoAberto(categoria: CategoriaCodigo): Promise<ChamadoApi | null> {
  const { meus } = await api.meusChamados();
  const daCategoria = meus.filter((c) => c.categoria === categoria);
  if (daCategoria.length === 0) return null;
  // `meusChamados` já vem ordenado por mais recente; prioriza os não resolvidos.
  const aberto = daCategoria.find((c) => !RESOLVIDO.includes(c.status));
  return aberto ?? daCategoria[0];
}

/**
 * Converte a data informada na triagem (ex.: "08/06/2026" ou "8/6") para
 * o formato AAAA-MM-DD esperado pelo backend. Se não reconhecer, devolve o dia
 * de hoje (a data exata fica no texto do chamado de qualquer forma).
 */
export function parseDataOcorrencia(texto: string | undefined): string {
  const hoje = new Date();
  const padraoHoje = `${hoje.getFullYear()}-${doisDigitos(hoje.getMonth() + 1)}-${doisDigitos(
    hoje.getDate(),
  )}`;
  if (!texto) return padraoHoje;
  const t = texto.trim();
  // Já no formato ISO?
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (!m) return padraoHoje;
  const dia = doisDigitos(Number(m[1]));
  const mes = doisDigitos(Number(m[2]));
  let ano = m[3] ?? String(hoje.getFullYear());
  if (ano.length === 2) ano = `20${ano}`;
  return `${ano}-${mes}-${dia}`;
}

/** Monta um resumo curto das respostas da triagem para o atendente ler no chat. */
export function resumoTriagem(respostas: Record<string, string>): string {
  const linhas: string[] = [];
  if (respostas.data) linhas.push(`📅 Data: ${respostas.data}`);
  if (respostas.horario) linhas.push(`⏰ Horário correto: ${respostas.horario}`);
  if (respostas.descricao) linhas.push(`📝 Motivo: ${respostas.descricao}`);
  return linhas.join('\n');
}

/**
 * Conecta na sala do chamado e chama `onMensagem` a cada mensagem nova.
 * Devolve uma função para desconectar (usar no cleanup do efeito).
 */
export function conectarChat(chamadoId: string, onMensagem: (m: MensagemApi) => void): () => void {
  const socket: Socket = io(`${BASE}/chat`, {
    transports: ['websocket'],
    auth: { token: getToken() },
  });
  socket.on('connect', () => socket.emit('entrar', chamadoId));
  socket.on('mensagem:nova', (m: MensagemApi) => {
    if (m?.chamadoId === chamadoId) onMensagem(m);
  });
  return () => {
    socket.emit('sair', chamadoId);
    socket.disconnect();
  };
}
