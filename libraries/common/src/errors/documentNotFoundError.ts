import { CustomError } from './customError';

export class DocumentNotFoundError extends CustomError {
  statusCode = 404;

  constructor(public message: string) {
    super(message);

    Object.setPrototypeOf(this, DocumentNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
