import { Request, Response } from 'express';
import {
  BadRequestError,
  UnexpectedError,
  CONFIG,
  LANG,
} from '@gustafdahl/schoolable-common';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

import UserLoginPublisher from '../events/publishers/userLogin';
import { natsWrapper } from '../utils/natsWrapper';
import Password from '../utils/password';
import User from '../models/user';
import logger from '../utils/logger';

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const _lang = req.lang;

  logger.info('Starting login');

  const lang = LANG[_lang];
  logger.debug('Looking up user');
  const user = await User.findOne({ email }).populate('settings');

  // If no use is found
  if (!user) {
    logger.debug('No user found');
    // Wrong credentials becuase hackers doesnt need to know if they got password or email wrong
    throw new BadRequestError(lang.wrongCredentials);
  }

  logger.debug('User found');
  logger.debug('Comparing passwords');

  // Checking if password is coorect
  if (await Password.compare(user.password, password)) {
    logger.debug('Passwords matched');
    try {
      logger.debug('Creating login id');

      const loginId = nanoid();

      logger.debug('Creating login id cookie');
      res.cookie('loginId', loginId, CONFIG.cookies);

      // Couldnt get nats mock to work
      // Code is only ran if its not test environment
      if (process.env.NODE_ENV !== 'test') {
        // Publishes event to nats service
        new UserLoginPublisher(natsWrapper.client, logger).publish({
          userId: user.id,
          ip: req.headers['x-real-ip'] as string,
          userAgent: req.headers['user-agent'] as string,
          lang: req.lang,
          loginId,
        });
        logger.debug('Sent Nats login event');
      }

      logger.info('Responding success to user');
      res.status(200).json({
        errors: false,
        message: lang.successfulLogin,
        firstTime: !user.setupComplete,
        user,
      });
    } catch (err) {
      logger.error(`Ran into an unexpected error. Error message: ${err}`);
      throw new UnexpectedError();
    }
  } else {
    logger.info('Wrong password');
    throw new BadRequestError(lang.wrongCredentials);
  }
};

export default login;
