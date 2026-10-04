import { Server } from 'socket.io';
import env from './env.js';
import { authenticateToken } from '../middleware/auth.js';

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Connections must present the same JWT as API requests (sent as `auth.token`)
  io.use(async (socket, next) => {
    try {
      const user = await authenticateToken(socket.handshake.auth?.token);
      socket.data.userId = String(user._id);
      next();
    } catch (error) {
      next(new Error(error.statusCode === 401 ? 'Unauthorized' : 'Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    // A socket only ever joins its own user's room. The id comes from the verified
    // token, not from the client, so nobody can listen to another user's notifications.
    socket.join(`user:${socket.data.userId}`);
    if (env.isDev) console.log(`Socket connected: ${socket.id} (user ${socket.data.userId})`);

    socket.on('disconnect', () => {
      if (env.isDev) console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};
