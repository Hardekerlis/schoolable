/** @format */

import { app } from './app';
import { CONFIG } from './library';
import { logger } from './logger/logger';
import { connect } from './database/connect';
import { textSync } from 'figlet';

const drawSchoolableLogo = async () => {
  // let rows = [''];
  //
  // let terminalRows = 14;
  // let row = 0;
  //
  // for (let i = 0; i < terminalRows + 1; i++) {
  //   rows[i] = '';
  // }
  //
  // const centerRowNum = Math.round(rows.length / 2 - 1);
  // const displayCenter = Math.round(rows[centerRowNum].length / 2);
  //
  // for (let j = 0; j <= terminalRows; j++) {
  //   for (let i = 0; i < process.stdout.columns; i++) {
  //     if (
  //       i === 0 ||
  //       i === process.stdout.columns - 1 ||
  //       row === 0 ||
  //       row === terminalRows
  //     ) {
  //       rows[row] += '#';
  //       if (i === process.stdout.columns - 1) row++;
  //     } else rows[row] += ' ';
  //   }
  // }
  //
  // for (const row of rows) {
  //   console.log(row);
  // }
  // for (const i of rows) {
  //   console.log(i[0]);
  // }
  // console.log(centerRowNum);
  return textSync('Schoolable platform');
};

const startServer = async () => {
  const { env } = process;
  console.clear();

  console.log(await drawSchoolableLogo());

  logger.info('Starting server...');

  if (CONFIG.dev) {
    logger.warn(
      'The application is in dev mode. If this is an production environment please change dev to false in the config',
    );
  }

  try {
    logger.info('Connecting to MongoDB');
    await connect();
    logger.info('Successfully connected to MongoDB');
  } catch (err) {
    logger.warn(`Failed to connect to MongoDB. Error message: ${err}`);
  }

  env.NODE_ENV = !env.NODE_ENV ? 'dev' : env.NODE_ENV;

  app.listen(CONFIG.port, () => {
    logger.info(`Listening on port *:${CONFIG.port}`);
  });
};

if (!CONFIG.setupComplete) {
  logger.info('Starting setup...');
} else if (CONFIG.setupComplete) {
  logger.debug('Setup has been completed');
  logger.info('Starting the server...');
}

startServer();
