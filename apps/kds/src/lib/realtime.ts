import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectRealtime(token: string): Socket {
  if (socket && socket.connected) return socket;
  if (socket) socket.disconnect();
  socket = io(`${process.env.NEXT_PUBLIC_REALTIME_URL}/realtime`, {
    transports: ['websocket'],
    auth: { token },
  });
  return socket;
}

export function disconnectRealtime(): void {
  socket?.disconnect();
  socket = null;
}
