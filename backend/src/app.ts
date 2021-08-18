/** @format */

// --- Libraries ---
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
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
  __dirname.substring(0, __dirname.indexOf('/src')) + '/config/app-config.yml';

ConfigHandler.loadConfig(configPath);

try {
  Secrets.generateKeySecret('JWT_KEY');
  Secrets.loadSecret('JWT_KEY');
} catch (err) {
  Secrets.generateKeySecret('JWT_KEY');
  Secrets.loadSecret('JWT_KEY');
}

const app = express();

// const whitelist = ["http://localhost:3500"]

app.use(
  cors({
    credentials: true,
    origin: true,
  }),
);

app.set('trust proxy', true);

// app.use(urlencoded({ extended: true }));

app.use(
  json({
    limit: '5mb',
  }),
);
// TODO
// Add maxAge calculation
app.use(
  cookieSession({
    name: 'session',
    signed: CONFIG.cookies.signed,
    secure: CONFIG.cookies.secure,
  }),
);

import loginRouter from './routes/account/login';
import stagesRouter from './routes/setup/stages';
import courseRouter from './routes/courses/courseRouter';
import utilsRouter from './routes/utils/utilsRouter';
// --- Routers ---
// if (CONFIG.setupComplete) {
//   // app.use(liveRouter);
// } else if (!CONFIG.setupComplete) {
//   // app.use(setupRouter);
// }

// console.log(adminRouter);

app.use(loginRouter);
app.use(stagesRouter);
app.use(courseRouter);
app.use(utilsRouter);

import adminRouter from './routes/admin/adminRouter';
app.use(adminRouter);
// ---------------

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
