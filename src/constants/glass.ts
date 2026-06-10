import type { Esquema } from '@/context/theme-pref';

/** Gradiente de fundo do app — navy suave (mesma família do azul da marca). */
export const Gradiente: Record<Esquema, [string, string, string]> = {
  light: ['#EAF0F8', '#F3F6FB', '#E6EDF6'],
  dark: ['#0B1220', '#101B30', '#090F1B'],
};

/**
 * Tintura translúcida das superfícies de vidro.
 * `overlay` = vidro padrão (sutil); `overlayForte` = mais opaco (legibilidade,
 * ex.: card de login e gaveta sobre fundos saturados).
 */
export const Vidro: Record<
  Esquema,
  { overlay: string; overlayForte: string; border: string }
> = {
  light: {
    overlay: 'rgba(255,255,255,0.55)',
    overlayForte: 'rgba(255,255,255,0.88)',
    border: 'rgba(15,23,42,0.08)',
  },
  dark: {
    overlay: 'rgba(28,42,68,0.55)',
    overlayForte: 'rgba(18,29,49,0.92)',
    border: 'rgba(150,176,220,0.16)',
  },
};
