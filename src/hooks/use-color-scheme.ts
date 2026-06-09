import { useThemePref } from '@/context/theme-pref';

/** Esquema efetivo (respeita a preferência do usuário). */
export function useColorScheme() {
  return useThemePref().esquema;
}
