import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { createServer } from 'http';
import { app } from './app';
import { CONFIG } from '@gustafdahl/schoolable-common';

const pubClient = createClient({
  host: CONFIG.redis.host,
  port: CONFIG.redis.port,
});
const subClient = pubClient.duplicate();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  adapter: createAdapter(pubClient, subClient),
  path: '/api/notifications/sockets/',
  cors: {
    origin: 'http://dev.schoolable.se',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.emit('hostname', os.hostname());
});

export { io, httpServer };
