/** @format */

import DailyRotateFile from 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;
import { ConfigHandler, CONFIG } from './config';

/*
  Translates Winston timestamp into understandable timeformat
  @params {string} timestamp string from Winston lib
  @returns {string} the time in the following format; hours:minutes:seconds
*/
const getTime = (timestamp: string): string => {
  let formatedTimestamp = new Date(timestamp);
  const hours = formatedTimestamp.getHours().toString();
  const minutes = formatedTimestamp.getMinutes().toString();
  const seconds = formatedTimestamp.getSeconds().toString();

  return `${hours.length === 1 ? '0' : ''}${hours}:${
    minutes.length === 1 ? '0' : ''
  }${minutes}:${seconds.length === 1 ? '0' : ''}${seconds}`;
};

// Format for the logs
const customFormat = printf(({ level, message, timestamp }) => {
  return `[${getTime(timestamp)}][${level}]: ${message}`;
});

// Options for dailyRotateFile. This is disabled if debug is set to true
const dailyRotateFileOpts = {
  filename: '%DATE%.log', // %DATE% is a placeholder for datePattern
  datePattern: 'D-M-yyyy', // Day of month, Month of the year, Year
  zippedArchive: true, // Zips old logs
  maxSize: CONFIG.logs.maxFileSize, // Maxsize of log files, 50mb
  dirname: 'logs',
  createSymlink: true, // Creates a current.log file
  level: 'info', // log level
  frequency: CONFIG.logs.newLogFileFrequency, // How often a new log file should be created
};

const logger = createLogger({
  // Custom format for log messages
  format: combine(label({ label: 'Schoolable' }), timestamp(), customFormat),
  transports: [
    new transports.Console({
      /* The log level, if debug is true in config debug messages will be logged  to the console */
      level: CONFIG.debug ? 'debug' : 'warn',
      handleExceptions: true,
    }),
  ],
});

// Daily rotation of log files is only enabled when debug is false
if (!CONFIG.debug) {
  logger.add(new DailyRotateFile(dailyRotateFileOpts));
}

export const winstonTestSetup = () => {
  logger.transports.forEach((t) => (t.silent = true));
};

export default logger;
