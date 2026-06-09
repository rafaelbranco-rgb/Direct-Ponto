/**
 * Tipos de domínio do app do colaborador.
 * Espelham (de forma simplificada) o schema do banco que será criado no backend.
 */

/** Status colapsado para a visão do colaborador. */
export type StatusColaborador = 'PENDENTE' | 'APROVADO' | 'RECUSADO';

/** Códigos das categorias da "caixa de entrada" (espelham os Assuntos do Nexti Direct). */
export type CategoriaCodigo =
  | 'ATRASO'
  | 'FALTA'
  | 'ENTRADA_ANTECIPADA'
  | 'ATESTADO'
  | 'SAIDA_TARDIA'
  | 'SAIDA_ANTECIPADA'
  | 'ESQUECIMENTO'
  | 'SAIDA_EXPEDIENTE'
  | 'BANCO_HORAS';

export interface Categoria {
  codigo: CategoriaCodigo;
  label: string;
  emoji: string;
  descricao: string;
  /** Se true, o fluxo desta categoria espera anexo (ex.: atestado). */
  exigeAnexo?: boolean;
}

export interface Solicitacao {
  id: string;
  categoria: CategoriaCodigo;
  /** Dia da ocorrência (YYYY-MM-DD). */
  dataOcorrencia: string;
  /** Horário registrado no Nexti (quando aplicável). */
  horarioOriginal?: string;
  /** Horário que o colaborador propõe corrigir. */
  horarioProposto?: string;
  descricao: string;
  status: StatusColaborador;
  /** Obrigatório quando RECUSADO. */
  motivoRecusa?: string;
  temAnexo?: boolean;
  /** Quando a solicitação foi enviada (ISO). */
  criadoEm: string;
}
