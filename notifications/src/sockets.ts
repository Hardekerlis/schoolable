import { Server, Socket } from 'socket.io';
import { NextFunction, Request, Response } from 'express';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { createServer } from 'http';
import { app } from './app';
import {
  CONFIG,
  currentUser,
  UserPayload,
  UserTypes,
  requireAuth,
} from '@gustafdahl/schoolable-common';
import cookieParser from 'cookie-parser';
import { sign } from 'cookie-signature';

import User from './models/user';

import logger from './utils/logger';

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

declare module 'http' {
  interface IncomingMessage {
    currentUser?: UserPayload;
    signedCookies: any;
  }
}

// @ts-ignore
const wrap = (middleware: Function) => (socket: Socket, next) =>
  // @ts-ignore
  middleware(socket.request, {}, next);

io.use(wrap(cookieParser(process.env.JWT_KEY as string, CONFIG.cookies)));
io.use(wrap(currentUser));
// io.use(wrap(mid));

io.on('connection', (socket) => {
  const currentUser = socket.request.currentUser as UserPayload;

  socket.emit('ping', 'pong');

  // Creates a socket connection once the socket has pinged backend
  // Saves socket id in user
  socket.once('ping', async (msg) => {
    logger.verbose('Connection established');

    logger.debug('Adding socket id to user');

    logger.debug('Looking up user');
    const user = await User.findById(currentUser.id);

    if (!user) {
      logger.warn(
        'No user found. User was most likely removed. If not please report this to the developers',
      );

      logger.debug('Disconnecting socket');
      return socket.disconnect();
    }

    logger.debug('Found user');

    logger.debug('Pushing socket id to user');
    user.sockets?.push(socket.id);

    logger.debug('Saving user');
    await user.save();

    logger.info('Succesfully established a connection');
  });

  // Handels the disconnect
  // Removes the socket id from user
  socket.on('disconnecting', async (reason) => {
    logger.verbose(`Connection closed. Reason: ${reason}`);

    logger.info('Attempting to remove socket id from user');

    logger.debug('Looking up user');
    const user = await User.findById(currentUser.id);

    if (!user) {
      logger.warn(
        'No user found. User was most likely removed. If not please report this to the developers',
      );

      logger.info("Couldn't remove socket from ser because no user was found");
      return;
    }

    const index = user.sockets?.indexOf(socket.id)!;

    logger.debug('Removing socket id from user');
    console.log(user.sockets);
    user.sockets?.splice(index, 1);
    console.log(user.sockets);

    logger.debug('Saving user');
    await user.save();

    logger.info('Successfully removed socket from user');
  });
});

io.on('error', (err) => {
  logger.error(err);
});

export { io, httpServer };
