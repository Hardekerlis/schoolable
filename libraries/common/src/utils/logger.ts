import DailyRotateFile from 'winston-daily-rotate-file';
import { createLogger, format, transports, Logger } from 'winston';
const { combine, timestamp, label, printf, colorize } = format;

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

let logger: Logger;
// Quiet Winston when running tests
export const winstonTestSetup = () => {
  // @ts-ignore
  logger.transports.forEach((transport) => (transport.silent = true));
};

const Logger = (
  dirname: string,
  maxFileSize: string,
  newLogFileFrequency: string,
  debug: boolean,
) => {
  if (dirname) dirname = dirname;
  if (maxFileSize) maxFileSize = maxFileSize;
  if (newLogFileFrequency) newLogFileFrequency = newLogFileFrequency;
  if (debug) debug = debug;

  let format = combine(
    label({ label: 'Schoolable' }),
    timestamp(),
    customFormat,
  );

  if (debug) {
    format = combine(
      colorize({ all: true }),
      label({ label: 'Schoolable' }),
      timestamp(),
      customFormat,
    );
  }

  logger = createLogger({
    // Custom format for log messages
    format: format,
    transports: [
      new transports.Console({
        /* The log level, if debug is true in config debug messages will be logged  to the console */
        level: debug ? 'debug' : 'warn',
        handleExceptions: true,
      }),
    ],
  });

  // Options for dailyRotateFile. This is disabled if debug is set to true
  const dailyRotateFileOpts = {
    filename: '%DATE%.log', // %DATE% is a placeholder for datePattern
    datePattern: 'D-M-yyyy', // Day of month, Month of the year, Year
    zippedArchive: true, // Zips old logs
    maxSize: maxFileSize, // Maxsize of log files, 50mb
    dirname: dirname,
    createSymlink: true, // Creates a current.log file
    level: 'info', // log level
    frequency: newLogFileFrequency, // How often a new log file should be created
  };

  // Daily rotation of log files is only enabled when debug is false
  if (!debug) {
    logger.add(new DailyRotateFile(dailyRotateFileOpts));
  }

  return logger;
};

export { Logger };
