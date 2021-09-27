import { Request, Response } from 'express';
import {
  BadRequestError,
  UnexpectedError,
} from '@gustafdahl/schoolable-errors';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import jwt from 'jsonwebtoken';

import UserLoginPublisher from '../events/userLogin';
import { natsWrapper } from '../utils/natsWrapper';
import Password from '../utils/password';
import User from '../models/user';
import logger from '../utils/logger';

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const _lang = req.lang;

  const lang = LANG[_lang];
  logger.info('Looking up user');
  const user = await User.findOne({ email }).populate('settings');

  // If no use is found
  if (!user) {
    logger.info('No user found');
    // Wrong credentials becuase hackers doesnt need to know if they got password or email wrong
    throw new BadRequestError(lang.wrongCredentials);
  }

  logger.info('User found');
  logger.info('Comparing passwords');

  // Checking if password is coorect
  if (await Password.compare(user.password, password)) {
    logger.info('Passwords matched');
    try {
      logger.info('Creating token');
      // Creating token to be stored in cookie
      const token = jwt.sign(
        {
          email: user.email,
          id: user.id,
          userType: user.userType,
          name: user.name,
          lang: user.settings.language,
        },
        process.env.JWT_KEY as string,
      );

      logger.debug('Setting token in cookie');
      // Setting token as token in cookie
      res.cookie('token', token);

      // Couldnt get nats mock to work
      // Code is only ran if its not test environment
      if (process.env.NODE_ENV !== 'test') {
        // Publishes event to nats service
        new UserLoginPublisher(natsWrapper.client).publish({
          userId: user.id,
          ip: req.socket.remoteAddress || req.ip,
          headers: req.headers,
          lang: req.lang,
        });
        logger.info('Sent Nats login event');
      }

      logger.debug('Responding success to user');
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
