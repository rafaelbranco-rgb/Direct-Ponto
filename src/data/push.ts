/**
 * Web Push (PWA) do colaborador.
 *
 * Registra o service worker (`/sw.js`), inscreve no push com a chave VAPID do
 * backend e envia a inscrição para `/api/push/inscrever`. Só roda no web e
 * APÓS a permissão de notificação ter sido concedida.
 *
 * iOS: só funciona com a PWA **instalada na tela inicial** (iOS 16.4+). Em aba
 * normal do Safari o `pushManager.subscribe` falha — degradamos em silêncio
 * (o app segue com o socket/toast quando aberto).
 */
import { Platform } from 'react-native';

import { getToken } from './api';

const BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

let inscrito = false;

/** Converte a chave VAPID (base64url) para o formato que o PushManager espera. */
function base64ParaUint8(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * Pede ao navegador para tornar o storage PERSISTENTE (não despejável).
 * Sem isso, o Android/iOS pode apagar o `localStorage` do PWA por pressão de
 * espaço — e como o token de login fica lá, o colaborador cai no login de novo
 * ("toda vez que volto tenho que logar"). Em PWA instalado + permissão de
 * notificação concedida, os navegadores costumam CONCEDER. Idempotente e
 * silencioso (navegador sem suporte simplesmente ignora).
 */
export async function solicitarStoragePersistente(): Promise<void> {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return;
  try {
    const st: StorageManager | undefined = navigator.storage;
    if (!st?.persist || !st.persisted) return;
    if (await st.persisted()) return; // já é persistente
    await st.persist();
  } catch {
    /* sem suporte — segue (o token ainda fica em localStorage) */
  }
}

export async function registrarPush(): Promise<void> {
  if (Platform.OS !== 'web' || !BASE || inscrito) return;
  if (
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator) ||
    typeof window === 'undefined' ||
    !('PushManager' in window) ||
    typeof Notification === 'undefined' ||
    Notification.permission !== 'granted'
  ) {
    return;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const resp = await fetch(`${BASE}/api/push/chave-publica`);
    const { chave } = (await resp.json()) as { chave?: string };
    if (!chave) return;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ParaUint8(chave) as BufferSource,
      });
    }

    const token = getToken();
    await fetch(`${BASE}/api/push/inscrever`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(sub),
    });
    inscrito = true;
  } catch {
    /* sem push (iOS não instalado, navegador sem suporte, etc.) — segue com socket/toast */
  }
}
