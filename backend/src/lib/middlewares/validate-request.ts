/** @format */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { RequestValidationError } from '../errors';
import logger from '../misc/winston';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.debug(`Validating request`);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.info(`Validation failed`);
    throw new RequestValidationError(errors.array());
  }

  logger.debug(`Validation successful`);

  next();
};
