/** @format */

// --- Libraries ---
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
const os = require('os');
import {
  ConfigHandler,
  CONFIG,
  NotFoundError,
  errorHandler,
  Secrets,
} from '@schoolable/common';

// This is neccesary because ConfigHandler is located in a package and can't get the correct path otherwise
const configPath =
  __dirname.substring(0, __dirname.indexOf('/src')) + '/config/app-config.yml';

// Load the config file into CONFIG variable
ConfigHandler.loadConfig(configPath);

try {
  Secrets.loadSecret('JWT_KEY');
} catch (err) {
  Secrets.generateKeySecret('JWT_KEY');
  Secrets.loadSecret('JWT_KEY');
}

console.log(process.env.JWT_KEY);

const app = express();

app.set('trust proxy', true);
app.use(json());
// TODO
// Add maxAge calculation
app.use(
  cookieSession({
    signed: CONFIG.cookies.signed,
    secure: process.env.NODE_ENV !== 'test',
  }),
);

import registerRouter from './routes/account/register';
import loginRouter from './routes/account/login';

// --- Routers ---
// if (CONFIG.setupComplete) {
//   // app.use(liveRouter);
// } else if (!CONFIG.setupComplete) {
//   // app.use(setupRouter);
// }

app.use(registerRouter);
app.use(loginRouter);

// ---------------

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
