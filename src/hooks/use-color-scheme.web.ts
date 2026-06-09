import { useThemePref } from '@/context/theme-pref';

/** Esquema efetivo no web (a hidratação é tratada dentro do ThemePrefProvider). */
export function useColorScheme() {
  return useThemePref().esquema;
}
