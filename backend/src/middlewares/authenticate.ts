/** @format */

import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError, UserTypes } from '../library';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

var signature = require('cookie-signature');

import { logger } from '../logger/logger';
import Session from '../models/session';

export interface UserPayload {
  email: string;
  id: string;
  userType: UserTypes;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

// This function is from cookie-parser library
function signedCookie(str: string, secret: string) {
  if (typeof str !== 'string') {
    return undefined;
  }

  // This was s: instead of s% causing the function not to parse the cookie
  if (str.substr(0, 2) !== 's%') {
    return str;
  }

  var secrets = !secret || Array.isArray(secret) ? secret || [] : [secret];

  for (var i = 0; i < secrets.length; i++) {
    var val = signature.unsign(str.slice(2), secrets[i]);

    if (val !== false) {
      return val;
    }
  }

  return false;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Get cookie from session
  let { sessionId } = req.cookies.sessionId ? req.cookies : req.signedCookies;
  logger.info('Authenticating user');

  // Check if sessionId is defined
  if (!sessionId) {
    // Check if sessionId is sent in body for some reason
    sessionId = req.body.sessionId;
    // Check if sessionId is defiend and if it is a signed cookie
    if (sessionId && !mongoose.isValidObjectId(sessionId)) {
      // Parse cookie to readable format
      sessionId = signedCookie(sessionId, process.env.JWT_KEY as string);
    }
  }

  // If the cookie couldnt be parsed the function returns false as in no cookie
  // or if no cookie in general was sent
  if (!sessionId) {
    logger.info("User doesn't have session cookie");
    logger.info('Authentication failed');
    throw new NotAuthorizedError('Please login before you do that');
  }

  try {
    // Look up session
    const session = await Session.findById(sessionId);
    // If no session means the user never logged in
    if (!session) {
      logger.info(
        'No session with the session id contained in the cookie was found',
      );
      logger.info('Authentication failed');
      throw new NotAuthorizedError(
        'Session was not found. Please login before you do that',
      );
    }

    const token = session.value;
    // Decode jwt key and verify it is valid
    const payload = jwt.verify(
      token as string,
      process.env.JWT_KEY as string,
    ) as UserPayload;

    // Assign payload to req
    req.currentUser = payload;
    logger.info('Successfully authenticated user');
  } catch (err) {
    logger.warn(
      `Encountered an error while trying to verfiy a json webtoken. Error message: ${err}`,
    );
    logger.info('Authentication failed');
  }
  next();
};
