/** @format */

import { Request, Response } from 'express';

import createSession from './createSession';

import { CONFIG } from '../../library';
interface cookieOptions {
  httpOnly: boolean;
  signed: boolean;
  maxAge?: number;
}

// Create a session and get the id for it
const createAndSetCookie = async (
  req: Request,
  res: Response,
  userId: string,
  token: string,
) => {
  const sessionId = await createSession(req, userId, token);

  let cookieOptions: cookieOptions = {
    httpOnly: CONFIG.cookies.httpOnly,
    signed: CONFIG.cookies.signed,
  };

  if (CONFIG.cookies.maxAge > 0) {
    cookieOptions.maxAge = CONFIG.cookies.maxAge;
  }

  // Create a cookie with the session id
  res.cookie('sessionId', sessionId, cookieOptions);

  return true;
};

export default createAndSetCookie;
