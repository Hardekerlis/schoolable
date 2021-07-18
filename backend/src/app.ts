/** @format */

// --- Libraries ---
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import {
  ConfigHandler,
  CONFIG,
  NotFoundError,
  errorHandler,
  Secrets,
} from '@schoolable/common';

// Load the config file into CONFIG variable
const configPath =
  __dirname.substring(0, __dirname.indexOf('/backend')) +
  '/config/app-config.yml';

ConfigHandler.loadConfig(configPath);

try {
  Secrets.loadSecret('JWT_KEY');
} catch (err) {
  Secrets.generateKeySecret('JWT_KEY');
  Secrets.loadSecret('JWT_KEY');
}

const app = express();

app.set('trust proxy', true);

app.use(
  json({
    limit: '50mb',
  }),
);
// TODO
// Add maxAge calculation
app.use(
  cookieSession({
    signed: CONFIG.cookies.signed,
    secure: process.env.NODE_ENV !== 'test',
  }),
);

import loginRouter from './routes/account/login';
// --- Routers ---
// if (CONFIG.setupComplete) {
//   // app.use(liveRouter);
// } else if (!CONFIG.setupComplete) {
//   // app.use(setupRouter);
// }

app.use(loginRouter);

// ---------------

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
