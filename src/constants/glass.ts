import type { Esquema } from '@/context/theme-pref';

/** Gradiente de fundo do app (o "vidro" flutua sobre ele). */
export const Gradiente: Record<Esquema, [string, string, string]> = {
  light: ['#E9F1FF', '#F4F8FF', '#FFFFFF'],
  dark: ['#080B12', '#0E1422', '#070A10'],
};

/** Tintura translúcida das superfícies de vidro. */
export const Vidro: Record<Esquema, { overlay: string; border: string; tint: 'light' | 'dark' }> = {
  light: { overlay: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.70)', tint: 'light' },
  dark: { overlay: 'rgba(22,26,36,0.45)', border: 'rgba(255,255,255,0.12)', tint: 'dark' },
};

/** Cor de marca translúcida para o cabeçalho de vidro. */
export const VidroMarca: Record<Esquema, { overlay: string; border: string; tint: 'light' | 'dark' }> = {
  light: { overlay: 'rgba(32,138,239,0.82)', border: 'rgba(255,255,255,0.35)', tint: 'light' },
  dark: { overlay: 'rgba(11,91,192,0.70)', border: 'rgba(255,255,255,0.16)', tint: 'dark' },
};
