import { CustomError } from './customError';

export class InvalidObjectIdError extends CustomError {
  statusCode = 404;

  constructor(public message: string) {
    super(message);

    Object.setPrototypeOf(this, InvalidObjectIdError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
