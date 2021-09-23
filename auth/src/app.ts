/** @format */

// --- Libraries ---
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';

import { loadLanguages } from '@gustafdahl/schoolable-loadlanguages';
import { NotFoundError } from '@gustafdahl/schoolable-errors';
import { ConfigHandler, Secrets } from '@gustafdahl/schoolable-utils';
import { errorHandler } from '@gustafdahl/schoolable-middlewares';

// Get parent folder to check if it is in dev or in prod folder
process.env.PARENT_FOLDER = path.basename(path.dirname(__filename));

// Load the config file into CONFIG variable
const configPath =
  __dirname.substring(0, __dirname.indexOf(`/${process.env.PARENT_FOLDER}`)) +
  '/config/config.yml';

ConfigHandler.loadConfig(configPath);

const languagePath =
  __dirname.substring(0, __dirname.indexOf(`/${process.env.PARENT_FOLDER}`)) +
  '/languages/';

loadLanguages(languagePath);

try {
  // Try to load secret
  Secrets.loadSecret('JWT_KEY');

  // If no secret was found generete a key and load it
  if (!process.env.JWT_KEY) {
    Secrets.generateKeySecret('JWT_KEY');
  }
} catch (err) {
  Secrets.generateKeySecret('JWT_KEY');
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

// app.use(urlencoded({ extended: false }));

app.use(
  json({
    limit: '5mb',
  }),
);
// TODO
// Add maxAge calculation
app.use(cookieParser(process.env.JWT_KEY as string));

import router from './routes';
app.use('/api/auth', router);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
