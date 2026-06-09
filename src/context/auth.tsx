import { createContext, useContext, useState, type ReactNode } from 'react';

export type Usuario = {
  nome: string;
  /** CPF ou matrícula informado no login. */
  identificador: string;
};

type AuthContextValue = {
  usuario: Usuario | null;
  entrar: (usuario: Usuario) => void;
  sair: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Autenticação em memória (protótipo). Na integração, o `entrar` fará a
 * chamada real ao backend (login por CPF/matrícula — RF-01) e guardará o token.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  return (
    <AuthContext.Provider
      value={{ usuario, entrar: setUsuario, sair: () => setUsuario(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
