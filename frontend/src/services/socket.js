import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    const serverUrl = import.meta.env.VITE_API_URL || window.location.origin;
    socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO Frontend] Connected to real-time server:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket.IO Frontend] Disconnected from server.');
    });
  }
  return socketInstance;
}
