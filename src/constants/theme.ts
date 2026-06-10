/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#13203A', // tinta navy (mais elegante que preto puro)
    background: '#FFFFFF',
    backgroundElement: '#EEF2F8',
    backgroundSelected: '#DDE4EF',
    textSecondary: '#5A6478',
  },
  dark: {
    // Família navy derivada do azul da marca (#234FA0) — fundo escuro coeso,
    // sem preto puro, para combinar com o header azul.
    text: '#EEF3FB',
    background: '#0B1220',
    backgroundElement: '#16233A',
    backgroundSelected: '#21324F',
    textSecondary: '#9DB0CC',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
    /** Wordmark da marca (cai em serifa elegante até bundlar a fonte no nativo). */
    brand: 'Georgia',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    brand: 'serif',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
    brand: 'var(--font-brand)',
  },
}) as {
  sans: string;
  serif: string;
  rounded: string;
  mono: string;
  brand: string;
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
