import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type Preferencia = 'system' | 'light' | 'dark';
export type Esquema = 'light' | 'dark';

type ThemePrefValue = {
  preferencia: Preferencia;
  definir: (p: Preferencia) => void;
  /** Esquema efetivo já resolvido (system → claro/escuro do aparelho). */
  esquema: Esquema;
};

const ThemePrefContext = createContext<ThemePrefValue | undefined>(undefined);

/**
 * Mantém a preferência de tema do usuário (claro/escuro/sistema).
 * Em memória por enquanto; na próxima fase persistimos (AsyncStorage).
 */
export function ThemePrefProvider({ children }: { children: ReactNode }) {
  const sistema = useRNColorScheme();
  const [preferencia, definir] = useState<Preferencia>('system');

  // Hidratação no web: evita divergência entre render estático e cliente.
  const [hidratado, setHidratado] = useState(false);
  useEffect(() => setHidratado(true), []);
  const sistemaSeguro: Esquema = hidratado && sistema === 'dark' ? 'dark' : 'light';

  const esquema: Esquema = preferencia === 'system' ? sistemaSeguro : preferencia;

  return (
    <ThemePrefContext.Provider value={{ preferencia, definir, esquema }}>
      {children}
    </ThemePrefContext.Provider>
  );
}

export function useThemePref() {
  const ctx = useContext(ThemePrefContext);
  if (!ctx) throw new Error('useThemePref precisa estar dentro de <ThemePrefProvider>');
  return ctx;
}
