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
  primary: '#2B57AD',
  primaryDark: '#173A75',
  onPrimary: '#FFFFFF',

  // Dourado da logo (acento) — mais forte/vivo para ganhar presença e elegância.
  accent: '#F2B63D',
  accentDark: '#D49526',

  // Família navy (fundos escuros coesos com o azul)
  navy: '#0B1220',
  navyDeep: '#070D18',

  /** Gradiente do header: do azul (topo) descendo a um navy profundo, para
   *  fundir suavemente no corpo escuro em vez de virar um bloco azul. */
  headerGradient: ['#2B57AD', '#1C3E78', '#13294C'] as [string, string, string],

  /** Gradiente do fundo do login (navy elegante com leve toque de azul). */
  loginGradient: ['#15294E', '#0E1B33', '#0A1322'] as [string, string, string],

  // sutil para divisórias e fundos de busca sobre o header
  searchBg: 'rgba(255,255,255,0.18)',
  searchPlaceholder: 'rgba(255,255,255,0.80)',
} as const;

/**
 * Cores dos status que o COLABORADOR enxerga. No backend o fluxo tem mais
 * estados (EM_ANALISE_GESTOR, APROVADA_DP, etc.), mas para o colaborador
 * colapsamos em três rótulos simples. Variantes por tema: no escuro usamos
 * fundo tingido translúcido + texto vivo (pastel claro não combina com o navy).
 */
export const StatusUI = {
  PENDENTE: {
    label: 'Pendente',
    light: { bg: '#FFF3DC', fg: '#B7791F' },
    dark: { bg: 'rgba(225,162,44,0.18)', fg: '#F2C879' },
  },
  APROVADO: {
    label: 'Aprovado',
    light: { bg: '#DFF6E6', fg: '#1A7F4B' },
    dark: { bg: 'rgba(52,190,130,0.18)', fg: '#6FE0A6' },
  },
  RECUSADO: {
    label: 'Recusado',
    light: { bg: '#FDE3E3', fg: '#C0341D' },
    dark: { bg: 'rgba(224,90,80,0.20)', fg: '#FF9C8E' },
  },
} as const;
