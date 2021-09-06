/** @format */

import { Request } from 'express';
import geoip from 'geoip-lite';
import { CONFIG } from '../../library';

import Session from '../../models/session';

/*
  Create and save session in database
  @param {Request} the request object which comes with requests
  @param {string} the user id of the user who wants a session
  @param {string} the value of which should be stored in the session. could be jwt
*/
const createSession = async (
  req: Request,
  userId: string,
  value: string,
  lang: string,
): Promise<string> => {
  const ip = CONFIG.dev ? '78.73.146.89' : req.socket.remoteAddress || req.ip;
  const geo = geoip.lookup(ip);

  const location = {
    country: geo ? geo.country : 'unknown',
    region: geo ? geo.region : 'unknown',
    city: geo ? geo.city : 'unknown',
    ll: geo ? geo.ll : ['unknown', 'unknown'],
    metro: geo ? geo.metro : 'unknown',
    area: geo ? geo.area : 'unknown',
    timezone: geo ? geo.timezone : 'unknown',
  };

  const { headers } = req;

  const session = Session.build({
    userId: userId,
    lang: lang,
    value: value,
    ip: ip,
    headers: headers,
    date: new Date(),
    location: location,
  });

  try {
    await session.save();
  } catch (err) {
    console.error(err);
  }

  return session.id.toString();
};

export default createSession;
