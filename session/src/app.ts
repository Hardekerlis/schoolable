/** @format */

// --- Libraries ---
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';

import {
  loadLanguages,
  errorHandler,
  NotFoundError,
  ConfigHandler,
  CONFIG,
} from '@gustafdahl/schoolable-common';

// Get parent folder to check if it is in dev or in prod folder
process.env.ROOT_FOLDER = __dirname.substring(
  0,
  __dirname.indexOf(`/${path.basename(path.dirname(__filename))}`),
);

// Load the config file into CONFIG variable
const configPath = `${process.env.ROOT_FOLDER}/config/config.yml`;

ConfigHandler.loadConfig(configPath);

const languagePath = `${process.env.ROOT_FOLDER}/languages/`;

loadLanguages(languagePath);

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
app.use(cookieParser(process.env.JWT_KEY as string, CONFIG.cookies));

import router from './routes';
app.use('/api/session', router);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
