/** @format */

import { Logger, CONFIG, ConfigHandler } from '@gustafdahl/schoolable-utils';

const logsFolder = `${process.env.ROOT_FOLDER}/logs/`;

const configPath = `${process.env.ROOT_FOLDER}/config/config.yml`;

ConfigHandler.loadConfig(configPath);

const logger = Logger(
  logsFolder,
  CONFIG.logs.maxFileSize,
  CONFIG.logs.newLogFileFrequency,
  CONFIG.debug,
);

export default logger;
