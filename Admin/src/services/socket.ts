import { io, Socket } from 'socket.io-client';

let adminSocket: Socket | null = null;

export function getAdminSocket(): Socket {
  if (!adminSocket) {
    adminSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    adminSocket.on('connect', () => {
      console.log('[Admin Socket] Connected to server with ID:', adminSocket?.id);
    });

    adminSocket.on('connect_error', (err) => {
      console.warn('[Admin Socket] Connection error:', err.message);
    });
  }
  return adminSocket;
}
