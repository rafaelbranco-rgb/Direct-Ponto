import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { Appearance } from 'react-native';

export type Preferencia = 'system' | 'light' | 'dark';
export type Esquema = 'light' | 'dark';

const CHAVE = 'contato:tema';

/* ───────── Store da preferência (persistida no web via localStorage) ─────────
 * Usamos useSyncExternalStore (em vez de useState + useEffect) para:
 *  - persistir a escolha entre recarregamentos (pendência do STATUS.md);
 *  - ser seguro na hidratação do web estático (snapshot do servidor = 'system');
 *  - não chamar setState dentro de efeito (exigência do React Compiler).
 */
let prefAtual: Preferencia | null = null;
const ouvintes = new Set<() => void>();

function temLocalStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}
function carregarPref(): Preferencia {
  if (temLocalStorage()) {
    const v = window.localStorage.getItem(CHAVE);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  }
  return 'system';
}
function lerPref(): Preferencia {
  if (prefAtual === null) prefAtual = carregarPref();
  return prefAtual;
}
function lerPrefServidor(): Preferencia {
  return 'system';
}
function assinarPref(notificar: () => void): () => void {
  ouvintes.add(notificar);
  return () => {
    ouvintes.delete(notificar);
  };
}
function definirPref(p: Preferencia): void {
  prefAtual = p;
  if (temLocalStorage()) window.localStorage.setItem(CHAVE, p);
  ouvintes.forEach((n) => n());
}

/* ───────── Store do esquema do aparelho (Appearance) ───────── */
function assinarSistema(notificar: () => void): () => void {
  const sub = Appearance.addChangeListener(notificar);
  return () => sub.remove();
}
function lerSistema(): Esquema {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}
function lerSistemaServidor(): Esquema {
  return 'light';
}

type ThemePrefValue = {
  preferencia: Preferencia;
  definir: (p: Preferencia) => void;
  /** Esquema efetivo já resolvido (system → claro/escuro do aparelho). */
  esquema: Esquema;
};

const ThemePrefContext = createContext<ThemePrefValue | undefined>(undefined);

/** Mantém a preferência de tema do usuário (claro/escuro/sistema), persistida no web. */
export function ThemePrefProvider({ children }: { children: ReactNode }) {
  const preferencia = useSyncExternalStore(assinarPref, lerPref, lerPrefServidor);
  const sistema = useSyncExternalStore(assinarSistema, lerSistema, lerSistemaServidor);
  const esquema: Esquema = preferencia === 'system' ? sistema : preferencia;

  return (
    <ThemePrefContext.Provider value={{ preferencia, definir: definirPref, esquema }}>
      {children}
    </ThemePrefContext.Provider>
  );
}

export function useThemePref() {
  const ctx = useContext(ThemePrefContext);
  if (!ctx) throw new Error('useThemePref precisa estar dentro de <ThemePrefProvider>');
  return ctx;
}
