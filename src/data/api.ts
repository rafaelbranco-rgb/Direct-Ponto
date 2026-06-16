/**
 * Cliente do backend (Contato API) para o app do colaborador.
 * Sem EXPO_PUBLIC_API_URL definido, `apiAtiva` é false e o app roda no modo demo (mock).
 *
 * Token: no web persiste em localStorage; no nativo fica em memória (até instalarmos
 * AsyncStorage/SecureStore para persistir entre aberturas).
 */
import { Platform } from 'react-native';

const BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');
export const apiAtiva = BASE.length > 0;

const TOKEN_KEY = 'contato:token';
let tokenMem: string | null = null;

export function getToken(): string | null {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return tokenMem;
    }
  }
  return tokenMem;
}
export function setToken(token: string | null) {
  tokenMem = token;
  if (Platform.OS === 'web') {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignora */
    }
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Tempo máximo de espera por resposta antes de abortar (rede fraca não trava a tela). */
const TIMEOUT_MS = 15000;

async function req<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const token = getToken();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${caminho}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: ctrl.signal,
    });
  } catch {
    // Falha de rede ou timeout: status 0 (não é 401/403 → não desloga a sessão).
    throw new ApiError(0, 'Sem conexão com o servidor. Verifique a internet e tente de novo.');
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 204) return undefined as T;
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(dados?.message) ? dados.message.join(', ') : (dados?.message ?? `Erro ${res.status}`);
    throw new ApiError(res.status, msg);
  }
  return dados as T;
}

/* ───────── Tipos do backend ───────── */
export interface UsuarioApi {
  id: string;
  tipo: 'COLABORADOR' | 'ATENDENTE';
  nome: string;
  cpf: string | null;
  matricula: string | null;
  email: string | null;
  setor: string | null;
}
export interface MensagemApi {
  id: string;
  chamadoId: string;
  autor: 'COLABORADOR' | 'ATENDENTE' | 'SISTEMA';
  texto: string;
  horario: string | null;
  anexoNome: string | null;
  anexoEhImagem: boolean | null;
  anexoMime?: string | null;
  anexoArquivo?: string | null;
  criadoEm: string;
}
export interface ChamadoApi {
  id: string;
  protocolo: string;
  categoria: string;
  status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'APROVADO' | 'RECUSADO';
  dataOcorrencia: string;
  horarioOriginal: string | null;
  horarioProposto: string | null;
  descricao: string | null;
  motivoRecusa: string | null;
  mensagens?: MensagemApi[];
  criadoEm: string;
}
export interface LoginResp {
  token: string;
  usuario: UsuarioApi;
  precisaTrocarSenha: boolean;
}

/* ───────── Endpoints (colaborador) ───────── */
export const api = {
  // Autenticação / 1º acesso por CPF (validação no RM via n8n)
  login: (identificador: string, senha: string) =>
    req<LoginResp>('POST', '/auth/login', { identificador, senha }),
  me: () => req<UsuarioApi>('GET', '/auth/me'),
  verificarCpf: (cpf: string) =>
    req<{ nome: string; senhaDefinida: boolean; precisaDefinirSenha: boolean }>(
      'POST',
      '/auth/colaborador/verificar',
      { cpf },
    ),
  definirSenha: (cpf: string, senha: string) =>
    req<LoginResp>('POST', '/auth/colaborador/definir-senha', { cpf, senha }),

  // Chamados do colaborador
  meusChamados: () => req<{ meus: ChamadoApi[] }>('GET', '/chamados'),
  detalhe: (id: string) => req<ChamadoApi>('GET', `/chamados/${id}`),
  abrirChamado: (corpo: {
    categoria: string;
    dataOcorrencia: string;
    horarioOriginal?: string;
    horarioProposto?: string;
    descricao?: string;
  }) => req<ChamadoApi>('POST', '/chamados', corpo),
  enviarMensagem: (id: string, texto: string, anexo?: { nome: string; ehImagem: boolean }) =>
    req<MensagemApi>('POST', `/chamados/${id}/mensagens`, {
      texto,
      anexoNome: anexo?.nome,
      anexoEhImagem: anexo?.ehImagem,
    }),
  /** Sobe um arquivo (foto/documento) como mensagem. Multipart — não usa req(). */
  enviarAnexoArquivo: async (
    id: string,
    arquivo: { uri: string; nome: string; mime?: string },
  ): Promise<MensagemApi> => {
    const form = new FormData();
    if (Platform.OS === 'web') {
      const r = await fetch(arquivo.uri);
      const blob = await r.blob();
      form.append('arquivo', blob, arquivo.nome);
    } else {
      // No React Native, FormData aceita { uri, name, type }.
      form.append('arquivo', {
        uri: arquivo.uri,
        name: arquivo.nome,
        type: arquivo.mime ?? 'application/octet-stream',
      } as unknown as Blob);
    }
    const token = getToken();
    const res = await fetch(`${BASE}/api/chamados/${id}/anexos`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray(dados?.message) ? dados.message.join(', ') : (dados?.message ?? `Erro ${res.status}`);
      throw new ApiError(res.status, msg);
    }
    return dados as MensagemApi;
  },

  trocarMinhaSenha: (senhaAtual: string | undefined, novaSenha: string) =>
    req<{ ok: boolean }>('PATCH', '/usuarios/me/senha', { senhaAtual, novaSenha }),
};
