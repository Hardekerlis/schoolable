import { ConfigHandler, CONFIG } from '@gustafdahl/schoolable-utils';
import path from 'path';

// Get parent folder to check if it is in dev or in prod folder
process.env.PARENT_FOLDER = path.basename(path.dirname(__filename));

// Load the config file into CONFIG variable
const configPath =
  __dirname.substring(0, __dirname.indexOf(`/${process.env.PARENT_FOLDER}`)) +
  '/config/config.yml';

ConfigHandler.loadConfig(configPath);

import logger from './utils/logger';
import { natsWrapper } from './utils/natsWrapper';
import { CourseQueueRemoveListener } from './events/listeners/courseQueueRemove';
import { PhaseQueueRemoveListener } from './events/listeners/phaseQueueRemove';
import { PhaseItemQueueRemoveListener } from './events/listeners/phaseItemQueueRemove';

const start = async () => {
  logger.info('Starting server...');

  if (CONFIG.dev) {
    logger.warn(
      'The application is in dev mode. If this is an production environment please change dev to false in the config',
    );
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  try {
    await natsWrapper.connect(
      CONFIG.nats.clusterId,
      process.env.NATS_CLIENT_ID as string,
      CONFIG.nats.url,
    );

    natsWrapper.client.on('connection', () => {
      logger.info('Connected to NATS');
    });

    natsWrapper.client.on('close', () => {
      logger.info('NATS connection closed');
      process.exit();
    });

    new CourseQueueRemoveListener(natsWrapper.client, logger).listen();
    new PhaseQueueRemoveListener(natsWrapper.client, logger).listen();
    new PhaseItemQueueRemoveListener(natsWrapper.client, logger).listen();

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    process.env.NODE_ENV = !process.env.NODE_ENV ? 'dev' : process.env.NODE_ENV;
    logger.info('Started server');
  } catch (err) {
    logger.error(err);
  }
};

start();
