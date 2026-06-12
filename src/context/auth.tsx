import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { api, apiAtiva, setToken, type UsuarioApi } from '@/data/api';
import { conectarNotificacoes, desconectarNotificacoes } from '@/data/socket-global';
import { pedirPermissaoNotificacao } from '@/data/notifications';

export type Usuario = {
  id?: string;
  nome: string;
  /** CPF ou matrícula informado no login. */
  identificador: string;
  tipo?: 'COLABORADOR' | 'ATENDENTE';
};

type AuthContextValue = {
  usuario: Usuario | null;
  carregando: boolean;
  /** Login demo (sem backend). */
  entrar: (usuario: Usuario) => void;
  /** Login real contra o backend (lança erro com mensagem). */
  entrarApi: (identificador: string, senha: string) => Promise<void>;
  /** Aplica a sessão após o 1º acesso (definir senha). */
  aplicarSessao: (token: string, usuario: UsuarioApi) => void;
  sair: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapear(u: UsuarioApi): Usuario {
  return { id: u.id, nome: u.nome, identificador: u.cpf ?? u.matricula ?? u.email ?? '', tipo: u.tipo };
}

/**
 * Autenticação do colaborador. Com EXPO_PUBLIC_API_URL definido, fala com o
 * backend (login por CPF + 1º acesso). Sem a URL, mantém o modo demonstração.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(apiAtiva);

  useEffect(() => {
    if (!apiAtiva) return;
    let vivo = true;
    api
      .me()
      .then((u) => vivo && setUsuario(mapear(u)))
      .catch(() => {
        if (!vivo) return;
        setToken(null);
        setUsuario(null);
      })
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, []);

  // Notificações em tempo real: conecta o socket global quando há colaborador
  // logado e desconecta ao sair.
  useEffect(() => {
    if (!apiAtiva) return;
    if (usuario) {
      pedirPermissaoNotificacao();
      conectarNotificacoes();
    } else {
      desconectarNotificacoes();
    }
  }, [usuario]);

  function entrar(u: Usuario) {
    setUsuario(u);
  }
  async function entrarApi(identificador: string, senha: string) {
    const r = await api.login(identificador, senha);
    setToken(r.token);
    setUsuario(mapear(r.usuario));
  }
  function aplicarSessao(token: string, u: UsuarioApi) {
    setToken(token);
    setUsuario(mapear(u));
  }
  function sair() {
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, entrarApi, aplicarSessao, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
