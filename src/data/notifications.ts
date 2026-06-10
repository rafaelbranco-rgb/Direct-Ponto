import { Platform } from 'react-native';

import type { CategoriaCodigo } from './types';

/**
 * Notificações do colaborador (protótipo, em memória).
 * Quando o backend existir, isto vira push real (FCM/APNs) + WebSocket; aqui
 * simulamos a chegada de respostas do atendimento e expomos:
 *  - lista de notificações + contagem de não-lidas (badges);
 *  - um "toast" in-app (banner) para a última notificação;
 *  - notificação nativa do navegador (Web Notifications API) no web/PWA.
 *
 * Componentes assinam via useSyncExternalStore (sem setState em efeito).
 */

export interface Notificacao {
  id: string;
  categoria: CategoriaCodigo;
  titulo: string;
  corpo: string;
  /** HH:MM */
  horario: string;
  lida: boolean;
}

let lista: Notificacao[] = [];
let toastAtivo: Notificacao | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
let versao = 0;
const ouvintes = new Set<() => void>();

function notificar() {
  versao += 1;
  ouvintes.forEach((l) => l());
}

function hhmm() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ───────── assinatura (useSyncExternalStore) ───────── */
export function assinarNotificacoes(cb: () => void) {
  ouvintes.add(cb);
  return () => {
    ouvintes.delete(cb);
  };
}
export function versaoNotificacoes() {
  return versao;
}
export function versaoServidor() {
  return 0;
}

/* ───────── leitura ───────── */
export function getNotificacoes() {
  return lista;
}
export function naoLidasCategoria(categoria: CategoriaCodigo) {
  return lista.reduce((acc, n) => acc + (n.categoria === categoria && !n.lida ? 1 : 0), 0);
}
export function totalNaoLidas() {
  return lista.reduce((acc, n) => acc + (n.lida ? 0 : 1), 0);
}
export function getToast() {
  return toastAtivo;
}

/* ───────── escrita ───────── */
export function adicionarNotificacao(categoria: CategoriaCodigo, titulo: string, corpo: string) {
  const n: Notificacao = {
    id: `n-${Date.now()}-${versao}`,
    categoria,
    titulo,
    corpo,
    horario: hhmm(),
    lida: false,
  };
  lista = [n, ...lista];
  dispararNativa(titulo, corpo);

  toastAtivo = n;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastAtivo = null;
    notificar();
  }, 4800);

  notificar();
}

export function fecharToast() {
  if (toastTimer) clearTimeout(toastTimer);
  toastAtivo = null;
  notificar();
}

export function marcarCategoriaLida(categoria: CategoriaCodigo) {
  let mudou = false;
  lista = lista.map((n) => {
    if (n.categoria === categoria && !n.lida) {
      mudou = true;
      return { ...n, lida: true };
    }
    return n;
  });
  if (mudou) notificar();
}

export function marcarTodasLidas() {
  if (lista.some((n) => !n.lida)) {
    lista = lista.map((n) => ({ ...n, lida: true }));
    notificar();
  }
}

/* ───────── notificação nativa do navegador (web/PWA) ───────── */
export function pedirPermissaoNotificacao() {
  if (Platform.OS !== 'web') return;
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  } catch {
    /* navegador sem suporte — segue só com toast/badge */
  }
}

function dispararNativa(titulo: string, corpo: string) {
  if (Platform.OS !== 'web') return;
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const n = new Notification(titulo, { body: corpo, icon: '/favicon.png' });
      void n;
    }
  } catch {
    /* ignora se o navegador bloquear */
  }
}
