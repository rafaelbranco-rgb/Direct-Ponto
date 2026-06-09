import type { CategoriaCodigo } from './types';

/**
 * Modelo de CONVERSA (o app é um chat de atendimento, como o Nexti Direct).
 * Cada categoria/assunto tem uma conversa entre o COLABORADOR e o ATENDENTE
 * (gestor/setor, que operará pela Plataforma Web). Mensagens de SISTEMA marcam
 * o ciclo do protocolo (solicitado / iniciado / finalizado).
 */

export type AutorMensagem = 'COLABORADOR' | 'ATENDENTE' | 'SISTEMA';

export interface AnexoMsg {
  nome: string;
  ehImagem: boolean;
  uri?: string;
}

export interface Mensagem {
  id: string;
  autor: AutorMensagem;
  texto: string;
  /** HH:MM — para balões de colaborador/atendente. */
  horario?: string;
  /** Linha de data das mensagens de sistema, ex.: "09/06/2026 às 10:08h". */
  data?: string;
  anexo?: AnexoMsg;
  /** Duplo-check (mensagem lida) — só para o colaborador. */
  lida?: boolean;
}

export interface Conversa {
  categoria: CategoriaCodigo;
  remetente: string;
  /** Triagem inicial já concluída? Se false, o app conduz a triagem. */
  triada: boolean;
  mensagens: Mensagem[];
}

/** Store em memória (protótipo). Vira chamadas à API na integração. */
const conversas: Record<string, Conversa> = {
  ATRASO: {
    categoria: 'ATRASO',
    remetente: 'RAFAEL MARTINIANO BARBOSA BRANCO',
    triada: true,
    mensagens: [
      { id: 'm1', autor: 'ATENDENTE', texto: 'Bom dia, declaração lançada.', horario: '07:54' },
      {
        id: 'm2',
        autor: 'ATENDENTE',
        texto: 'Peço que envie o documento ao link do SESMT.',
        horario: '07:54',
      },
      {
        id: 'm3',
        autor: 'SISTEMA',
        texto: 'Protocolo 11153697 — Atendimento finalizado por MIGUEL',
        data: '09/06/2026 às 07:54h',
      },
      {
        id: 'm4',
        autor: 'SISTEMA',
        texto: 'Protocolo 11164859 — Atendimento solicitado',
        data: '09/06/2026 às 10:08h',
      },
      { id: 'm5', autor: 'COLABORADOR', texto: 'Bom dia', horario: '10:08', lida: true },
      { id: 'm6', autor: 'COLABORADOR', texto: 'qual seria o link ?', horario: '10:08', lida: true },
      {
        id: 'm7',
        autor: 'SISTEMA',
        texto: 'Protocolo 11164859 — Atendimento iniciado por ELIZA',
        data: '09/06/2026 às 14:35h',
      },
    ],
  },
};

export function getConversa(codigo: CategoriaCodigo, remetentePadrao: string): Conversa {
  if (!conversas[codigo]) {
    conversas[codigo] = { categoria: codigo, remetente: remetentePadrao, triada: false, mensagens: [] };
  }
  return conversas[codigo];
}

export function salvarConversa(conversa: Conversa) {
  conversas[conversa.categoria] = conversa;
}

export function ultimaMensagem(codigo: CategoriaCodigo): Mensagem | undefined {
  const c = conversas[codigo];
  if (!c || c.mensagens.length === 0) return undefined;
  return c.mensagens[c.mensagens.length - 1];
}

/** Gera um número de protocolo fictício. */
export function novoProtocolo(): number {
  return 11000000 + (Date.now() % 1000000);
}

export interface PassoTriagem {
  chave: string;
  pergunta: string;
  tipo: 'texto' | 'anexo';
}

const SEM_HORARIO: CategoriaCodigo[] = ['FALTA', 'ATESTADO', 'BANCO_HORAS'];

/** Passos da pequena triagem inicial, por categoria. */
export function passosTriagem(codigo: CategoriaCodigo): PassoTriagem[] {
  const data: PassoTriagem = {
    chave: 'data',
    pergunta: 'Qual foi a data da ocorrência? (ex.: 08/06/2026)',
    tipo: 'texto',
  };
  const horario: PassoTriagem = {
    chave: 'horario',
    pergunta: 'Qual o horário correto que deveria constar? (ex.: 08:00)',
    tipo: 'texto',
  };
  const descricao: PassoTriagem = {
    chave: 'descricao',
    pergunta: 'Descreva brevemente o motivo.',
    tipo: 'texto',
  };
  const anexo: PassoTriagem = {
    chave: 'anexo',
    pergunta: 'Por favor, anexe o atestado/comprovante tocando no ícone de clipe (anexar) abaixo.',
    tipo: 'anexo',
  };

  if (codigo === 'ATESTADO') return [data, descricao, anexo];
  if (SEM_HORARIO.includes(codigo)) return [data, descricao];
  return [data, horario, descricao];
}
