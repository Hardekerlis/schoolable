/** @format */

import { CustomError } from './customError';

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;

  constructor() {
    super('Database connection error');

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Database connection error' }];
  }
}
