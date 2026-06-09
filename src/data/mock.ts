import type { Categoria, CategoriaCodigo, Solicitacao } from './types';

/**
 * Dados de exemplo enquanto o backend não existe.
 * Trocar por chamadas à API (Nexti + nosso backend) na fase de integração.
 */

export const CATEGORIAS: Categoria[] = [
  { codigo: 'ATRASO', label: 'Atraso', icone: 'time-outline', descricao: 'Cheguei depois do horário' },
  { codigo: 'FALTA', label: 'Falta', icone: 'close-circle-outline', descricao: 'Não compareci ao trabalho' },
  {
    codigo: 'ENTRADA_ANTECIPADA',
    label: 'Entrada Antecipada',
    icone: 'sunny-outline',
    descricao: 'Iniciei antes do horário',
  },
  {
    codigo: 'ATESTADO',
    label: 'Envio de Atestado',
    icone: 'document-text-outline',
    descricao: 'Atestado médico / declaração',
    exigeAnexo: true,
  },
  { codigo: 'SAIDA_TARDIA', label: 'Saída Tardia', icone: 'moon-outline', descricao: 'Saí depois do horário' },
  {
    codigo: 'SAIDA_ANTECIPADA',
    label: 'Saída Antecipada',
    icone: 'exit-outline',
    descricao: 'Saí antes do horário',
  },
  {
    codigo: 'ESQUECIMENTO',
    label: 'Esquecimento',
    icone: 'help-circle-outline',
    descricao: 'Esqueci de bater o ponto',
  },
  {
    codigo: 'SAIDA_EXPEDIENTE',
    label: 'Saída Durante o Expediente',
    icone: 'walk-outline',
    descricao: 'Precisei sair no meio do expediente',
  },
  { codigo: 'BANCO_HORAS', label: 'Banco de Horas', icone: 'hourglass-outline', descricao: 'Compensação de horas' },
];

export const SOLICITACOES: Solicitacao[] = [
  {
    id: 's-001',
    categoria: 'ATRASO',
    dataOcorrencia: '2026-06-08',
    horarioOriginal: '08:23',
    horarioProposto: '08:00',
    descricao: 'Trânsito intenso na Av. Principal por conta de acidente.',
    status: 'APROVADO',
    criadoEm: '2026-06-08T11:40:00Z',
  },
  {
    id: 's-002',
    categoria: 'ATRASO',
    dataOcorrencia: '2026-06-02',
    horarioOriginal: '08:15',
    horarioProposto: '08:00',
    descricao: 'Consulta médica de rotina pela manhã.',
    status: 'PENDENTE',
    criadoEm: '2026-06-02T09:05:00Z',
  },
  {
    id: 's-003',
    categoria: 'ATESTADO',
    dataOcorrencia: '2026-06-05',
    descricao: 'Atestado de 1 dia — gripe.',
    status: 'PENDENTE',
    temAnexo: true,
    criadoEm: '2026-06-05T18:22:00Z',
  },
  {
    id: 's-004',
    categoria: 'FALTA',
    dataOcorrencia: '2026-05-28',
    descricao: 'Falta por motivo pessoal, sem comprovante.',
    status: 'RECUSADO',
    motivoRecusa: 'Falta sem comprovante não pode ser abonada. Será descontada.',
    criadoEm: '2026-05-28T20:10:00Z',
  },
  {
    id: 's-005',
    categoria: 'ESQUECIMENTO',
    dataOcorrencia: '2026-06-06',
    horarioOriginal: '—',
    horarioProposto: '17:48',
    descricao: 'Esqueci de registrar a saída ao fim do expediente.',
    status: 'APROVADO',
    criadoEm: '2026-06-06T19:00:00Z',
  },
  {
    id: 's-006',
    categoria: 'SAIDA_ANTECIPADA',
    dataOcorrencia: '2026-06-04',
    horarioOriginal: '16:10',
    horarioProposto: '17:00',
    descricao: 'Saída antecipada autorizada verbalmente pelo gestor.',
    status: 'PENDENTE',
    criadoEm: '2026-06-04T16:30:00Z',
  },
];

/**
 * Adiciona uma nova solicitação (em memória, só para o protótipo).
 * Na integração isto vira um POST para o nosso backend.
 */
export function adicionarSolicitacao(
  nova: Omit<Solicitacao, 'id' | 'status' | 'criadoEm'>,
): Solicitacao {
  const solicitacao: Solicitacao = {
    ...nova,
    id: `s-${Date.now()}`,
    status: 'PENDENTE',
    criadoEm: new Date().toISOString(),
  };
  SOLICITACOES.unshift(solicitacao);
  return solicitacao;
}

/** Solicitações de uma categoria, mais recentes primeiro. */
export function solicitacoesPorCategoria(codigo: CategoriaCodigo): Solicitacao[] {
  return SOLICITACOES.filter((s) => s.categoria === codigo).sort((a, b) =>
    b.criadoEm.localeCompare(a.criadoEm),
  );
}

export function categoriaPorCodigo(codigo: string): Categoria | undefined {
  return CATEGORIAS.find((c) => c.codigo === codigo);
}
