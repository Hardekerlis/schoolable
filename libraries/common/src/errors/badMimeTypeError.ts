import { CustomError } from './customError';

export class BadMimeTypeError extends CustomError {
  statusCode = 400;
  allowedFileTypes: object[];

  constructor(public message: string, allowedFileTypes: object[]) {
    super(message);

    this.allowedFileTypes = allowedFileTypes;

    Object.setPrototypeOf(this, BadMimeTypeError.prototype);
  }

  serializeErrors() {
    return [
      { message: this.message, supportedMimeTypes: this.allowedFileTypes },
    ];
  }
}
