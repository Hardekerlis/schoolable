/** @format */

import { Logger, CONFIG, ConfigHandler } from '@gustafdahl/schoolable-utils';

const logsFolder =
  __dirname.substring(0, __dirname.indexOf(`/${process.env.PARENT_FOLDER}`)) +
  '/logs/';

const configPath =
  __dirname.substring(0, __dirname.indexOf(`/${process.env.PARENT_FOLDER}`)) +
  '/config/config.yml';

ConfigHandler.loadConfig(configPath);

const logger = Logger(
  logsFolder,
  CONFIG.logs.maxFileSize,
  CONFIG.logs.newLogFileFrequency,
  CONFIG.debug,
);

export default logger;
