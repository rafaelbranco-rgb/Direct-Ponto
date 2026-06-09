/**
 * Identidade visual do "Contato".
 * TODO: substituir pelos valores oficiais da AIONS (cores e logo) quando o
 * setor de design liberar o manual de marca. Hoje uso o azul do splash.
 */
export const Brand = {
  appName: 'Contato',
  company: 'AIONS',
  tagline: 'Justificativa de Ponto',

  primary: '#208AEF',
  primaryDark: '#0B5BC0',
  onPrimary: '#FFFFFF',

  // sutil para divisórias e fundos de busca sobre o header
  searchBg: 'rgba(255,255,255,0.18)',
  searchPlaceholder: 'rgba(255,255,255,0.75)',
} as const;

/**
 * Cores dos status que o COLABORADOR enxerga. No backend o fluxo tem mais
 * estados (EM_ANALISE_GESTOR, APROVADA_DP, etc.), mas para o colaborador
 * colapsamos em três rótulos simples.
 */
export const StatusUI = {
  PENDENTE: { bg: '#FFF3DC', fg: '#B7791F', label: 'Pendente' },
  APROVADO: { bg: '#DFF6E6', fg: '#1A7F4B', label: 'Aprovado' },
  RECUSADO: { bg: '#FDE3E3', fg: '#C0341D', label: 'Recusado' },
} as const;
