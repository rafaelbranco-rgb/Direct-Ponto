import type { Esquema } from '@/context/theme-pref';

/** Gradiente de fundo do app — suave, sem branco agressivo. */
export const Gradiente: Record<Esquema, [string, string, string]> = {
  light: ['#E9EEF5', '#F1F4F9', '#E6ECF4'],
  dark: ['#0B0F17', '#121826', '#0A0E16'],
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
    overlay: 'rgba(28,33,44,0.55)',
    overlayForte: 'rgba(20,24,32,0.90)',
    border: 'rgba(255,255,255,0.10)',
  },
};
