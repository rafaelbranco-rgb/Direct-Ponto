/**
 * Socket global de NOTIFICAÇÕES do colaborador.
 *
 * Diferente do socket da tela de chat (que entra na sala de UM chamado), este
 * fica conectado o app inteiro (após o login) e recebe o evento `notificacao`
 * que o backend manda para a sala `user:<id>` do colaborador — resposta do
 * atendente ou decisão (aprovado/recusado). Cada evento vira uma notificação
 * (lista + badge + toast + notificação nativa do navegador).
 */
import { io, type Socket } from 'socket.io-client';

import { getToken } from './api';
import { adicionarNotificacao } from './notifications';
import type { CategoriaCodigo } from './types';

const BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

type NotifPayload = {
  tipo: 'mensagem' | 'decisao' | 'chamado';
  chamadoId: string;
  categoria?: string;
  de?: string;
  texto?: string;
  decisao?: 'APROVADO' | 'RECUSADO';
};

let socket: Socket | null = null;

/** Conecta o socket de notificações (idempotente). Chamar após o login. */
export function conectarNotificacoes() {
  if (!BASE || socket) return;
  socket = io(`${BASE}/chat`, {
    // Tenta WebSocket (rápido) e cai para long-polling quando o Wi-Fi está fraco
    // (ex.: andares longe do roteador) em vez de simplesmente não conectar.
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    auth: { token: getToken() },
  });

  socket.on('notificacao', (n: NotifPayload) => {
    const cat = (n.categoria ?? 'ATRASO') as CategoriaCodigo;
    if (n.tipo === 'decisao') {
      const txt =
        n.decisao === 'APROVADO'
          ? 'Sua justificativa foi aprovada. ✅'
          : 'Sua justificativa foi recusada.';
      adicionarNotificacao(cat, 'Contato • Resultado', txt);
    } else if (n.tipo === 'mensagem') {
      adicionarNotificacao(cat, `Contato • ${n.de ?? 'Atendimento'}`, n.texto || 'Nova mensagem.');
    }
  });
}

/** Desconecta (chamar no logout). */
export function desconectarNotificacoes() {
  socket?.disconnect();
  socket = null;
}
