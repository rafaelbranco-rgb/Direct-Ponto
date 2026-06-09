/**
 * Identidade visual da CONTATO (Serviços de Conservação e Manutenção).
 * Cores extraídas da logo oficial: azul royal + dourado.
 */
export const Brand = {
  appName: 'Contato',
  company: 'Contato',
  companyFull: 'Serviços de Conservação e Manutenção',
  tagline: 'Justificativa de Ponto',

  // Azul da logo
  primary: '#234FA0',
  primaryDark: '#173A75',
  onPrimary: '#FFFFFF',

  // Dourado da logo (acento)
  accent: '#E1A22C',
  accentDark: '#C2861A',

  // sutil para divisórias e fundos de busca sobre o header
  searchBg: 'rgba(255,255,255,0.20)',
  searchPlaceholder: 'rgba(255,255,255,0.80)',
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
