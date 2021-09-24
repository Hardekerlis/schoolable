import { Request, Response } from 'express';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import {
  NotAuthorizedError,
  UnexpectedError,
} from '@gustafdahl/schoolable-errors';
import { CONFIG } from '@gustafdahl/schoolable-utils';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import UserCreatedPublisher from '../events/userCreated';
import { natsWrapper } from '../utils/natsWrapper';
import User from '../models/user';
import UserSettings from '../models/userSettings';
import logger from '../utils/logger';

const register = async (req: Request, res: Response) => {
  const { email, userType, name } = req.body;
  const { currentUser } = req;

  logger.info('Starting user registration');
  // This check can only be true if an admin user exists
  if (currentUser && currentUser?.userType !== UserTypes.Admin) {
    logger.info('User is not allowed to create accounts');
    throw new NotAuthorizedError();
  }

  // Creating tempPassword for users first login
  // An email should be sent from email service with temp password to user
  const tempPassword = uuidv4();
  logger.debug(
    `Creating temp password. ${
      CONFIG.dev ? `Temppassword: ${tempPassword}` : ''
    }`,
  );

  // Building userSettigs so it can be stored on user as a subdoc
  logger.debug('Building new user settings');
  const userSettings = UserSettings.build({
    theme: 'dark',
    language: req.lang,
    notifications: [''],
  });

  try {
    logger.info('Trying to save new user settings');
    await userSettings.save();

    logger.debug('Building new user');
    const newUser = User.build({
      email,
      userType,
      name,
      password: tempPassword,
      settings: userSettings, // user settings is built above
    });

    logger.info('Trying to save new user');
    await newUser.save();

    logger.debug('Creating token');
    // Creating token to be stored in cookie
    const token = jwt.sign(
      {
        email: newUser.email,
        id: newUser.id,
        userType: newUser.userType,
        name: newUser.name,
        lang: newUser.settings.language,
      },
      process.env.JWT_KEY as string,
    );

    logger.info('Setting token cookie');
    // Setting token as token in cookie
    res.cookie('token', token);

    // Couldnt get nats mock to work
    // Code is only ran if its not test environment
    if (process.env.NODE_ENV !== 'test') {
      // Publishes event to nats service
      new UserCreatedPublisher(natsWrapper.client).publish({
        userId: newUser.id,
        email: newUser.email, // To send email to the user registered
        tempPassword, // Temp password to be included in email
      });

      logger.info('Sent Nats user registered event');
    }

    logger.info('User creation successful');
    res.status(201).json({
      errors: false,
      message: 'Successfully registered user',
      user: newUser,
      tempPassword: CONFIG.dev ? tempPassword : undefined, // Temp password is only included in body if application is in dev mode
    });
  } catch (err) {
    logger.error(`Ran into an unexpected error. Error message: ${err}`);
    throw new UnexpectedError();
  }
};

export default register;
