import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectRealtime(token: string): Socket {
  if (socket?.connected) return socket;
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
