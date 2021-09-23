/** @format */

import { CustomError } from './customError';

export class UnexpectedError extends CustomError {
  statusCode = 500;

  constructor() {
    super('The server ran into an unexpected error');

    Object.setPrototypeOf(this, UnexpectedError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: 'The server ran into an unexpected error',
      },
    ];
  }
}
