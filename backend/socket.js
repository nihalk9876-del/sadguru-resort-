const { Server } = require('socket.io');

let ioInstance = null;

function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket.IO] Real-time engine initialized.');
  return ioInstance;
}

function getIO() {
  return ioInstance;
}

function broadcastEvent(eventName, payload) {
  if (ioInstance) {
    try {
      ioInstance.emit(eventName, payload);
      console.log(`[Socket.IO Broadcast] Event: ${eventName}`);
    } catch (err) {
      console.warn(`[Socket.IO Broadcast Error] ${eventName}:`, err.message);
    }
  }
}

module.exports = {
  initSocket,
  getIO,
  broadcastEvent
};
