/** @format */

// --- Libraries ---
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

// --- Error handlers ---
import { ConfigHandler, CONFIG } from './lib/misc/config';
// Load the config file into CONFIG variable
ConfigHandler.loadConfig();
import { NotFoundError } from './lib/errors';
import { errorHandler } from './lib/middlewares';

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
// --- Routers ---
// if (CONFIG.setupComplete) {
//   // app.use(liveRouter);
// } else if (!CONFIG.setupComplete) {
//   // app.use(setupRouter);
// }

// ---------------

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
