'use client';

import { io, Socket } from 'socket.io-client';
import { getWsBase } from '@/lib/api';

let socket: Socket | null = null;
let boundToken: string | null = null;

export function getAdminSocket(token: string | null | undefined): Socket | null {
  if (!token) return null;

  if (socket && boundToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    socket = io(`${getWsBase()}/orders`, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socket.emit('joinAdmin');
    socket.emit('joinManager');
    boundToken = token;
  }

  return socket;
}

export function disconnectAdminSocket() {
  socket?.disconnect();
  socket = null;
  boundToken = null;
}
