/** @format */

import { Logger, CONFIG } from '../library';

const logsFolder = __dirname.substring(0, __dirname.indexOf('/src')) + '/logs/';

const logger = Logger(
  logsFolder,
  CONFIG.logs.maxFileSize,
  CONFIG.logs.newLogFileFrequency,
  CONFIG.debug,
);

export { logger };
