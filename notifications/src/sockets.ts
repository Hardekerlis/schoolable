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
});

io.on('connection', (socket) => {
  console.log('Connected');
});

export { io, httpServer };
