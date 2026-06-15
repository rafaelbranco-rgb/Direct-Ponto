import { adicionarNotificacao } from './notifications';
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

function hhmm() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Simula a resposta do atendimento alguns segundos depois (protótipo).
 * No backend, isto será uma resposta real do gestor/RH chegando via push/socket.
 * A mensagem é gravada na conversa e dispara uma notificação ao colaborador.
 */
const RESPOSTAS = [
  'Olá! Recebi sua solicitação e já estou analisando. Retorno em instantes.',
  'Obrigado pelas informações. Vou verificar no sistema e te respondo aqui.',
  'Certo! Já encaminhei para conferência. Qualquer coisa, aviso por aqui.',
];

export function agendarRespostaAtendente(categoria: CategoriaCodigo, rotuloCategoria: string) {
  const idx = conversas[categoria]?.mensagens.length ?? 0;
  setTimeout(() => {
    const conv = conversas[categoria];
    if (!conv) return;
    const texto = RESPOSTAS[idx % RESPOSTAS.length];
    conv.mensagens = [
      ...conv.mensagens,
      { id: `at-${Date.now()}`, autor: 'ATENDENTE', texto, horario: hhmm() },
    ];
    adicionarNotificacao(categoria, `Contato • ${rotuloCategoria}`, texto);
  }, 6500);
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
    pergunta:
      'Vamos começar pela data. Em que dia isso aconteceu? Escreva no formato dia/mês/ano, com barras — por exemplo: 08/06/2026.',
    tipo: 'texto',
  };
  const horario: PassoTriagem = {
    chave: 'horario',
    pergunta:
      'Agora o horário. Que horas deveriam ter sido registradas no seu ponto? Escreva como horas:minutos, com dois pontos — por exemplo: 08:00 (oito da manhã) ou 17:30.',
    tipo: 'texto',
  };
  const descricao: PassoTriagem = {
    chave: 'descricao',
    pergunta:
      'Por último, conte com suas próprias palavras o que aconteceu. Pode escrever à vontade — quanto mais detalhe, mais fácil para o RH entender e aprovar. Por exemplo: "Fiquei preso no trânsito por causa de um acidente na avenida."',
    tipo: 'texto',
  };
  const anexo: PassoTriagem = {
    chave: 'anexo',
    pergunta:
      'Para finalizar, preciso do atestado ou comprovante. Toque no ícone de "+" aqui embaixo e escolha "Câmera" para tirar uma foto do documento, ou "Galeria"/"Documento" para enviar um arquivo que você já tenha no celular.',
    tipo: 'anexo',
  };

  if (codigo === 'ATESTADO') return [data, descricao, anexo];
  if (SEM_HORARIO.includes(codigo)) return [data, descricao];
  return [data, horario, descricao];
}
