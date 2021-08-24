/** @format */

import { CustomError } from './custom-error';

// Couldnt understand error message if my life depended on it.
// Fix if you know how to...
// @ts-ignore
export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(public message?: string) {
    super(message ? message : 'Route not found');

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message ? this.message : 'Not found' }];
  }
}
