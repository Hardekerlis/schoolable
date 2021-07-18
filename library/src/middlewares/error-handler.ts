/** @format */

import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/errors-collection';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if the error is custom, aka from errors folder in lib
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ errors: err.serializeErrors() });
  }

  // If the error isn't specifically handled the error is unexpected and will be handled here
  res.status(400).send({
    errors: [{ message: 'Unexpected error', error: err }],
  });
};
