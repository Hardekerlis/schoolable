import { Request, Response } from 'express';
import {
  NotAuthorizedError,
  LANG,
  UserTypes,
  CONFIG,
  BadRequestError,
} from '@gustafdahl/schoolable-common';
import { nanoid } from 'nanoid';

import User from '../models/user';
import UserSettings from '../models/userSettings';

import UserCreatedPublisher from '../events/publishers/userCreated';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

const register = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];
  const { userType, email, name } = req.body;

  logger.info('Starting user registration');

  // First checking if user is logged in, if so, then checks if user is not admin
  // if (currentUser && currentUser?.userType !== UserTypes.Admin) {
  //   logger.debug('User is not allowed to create accounts');
  //   throw new NotAuthorizedError();
  // }

  // if (!process.env.ADMIN_EXISTS && userType === UserTypes.Admin) {
  //   logger.debug('Creating first account');
  //   process.env.ADMIN_EXISTS = 'true';
  // } else if (!process.env.ADMIN_EXISTS && userType !== UserTypes.Admin) {
  //   logger.debug(
  //     'Failed creating first account. The first account must be an admin',
  //   );
  //
  //   throw new BadRequestError(lang.firstAccMustBeAdmin);
  // } else if (
  //   (process.env.ADMIN_EXISTS === 'true' &&
  //     currentUser?.userType !== UserTypes.Admin) ||
  //   currentUser?.userType !== UserTypes.Admin
  // ) {
  //   console.log('?????');
  //   throw new NotAuthorizedError();
  // }

  logger.debug('Checking if an admin account exists');
  // Check if admin user has been registered
  if (process.env.ADMIN_EXISTS === 'true') {
    logger.debug('Admin account exists');
    logger.debug(
      'Checking if user trying to register an account is authenticated',
    );
    if (currentUser !== undefined) {
      logger.debug('User is authenticated');
      logger.debug('Checking if user is an admin');
      if (currentUser?.userType !== UserTypes.Admin) {
        logger.debug('User is not an admin');
        throw new NotAuthorizedError();
      }

      logger.debug('Registrating account');
    } else {
      logger.debug('User is not authenticated');
      throw new NotAuthorizedError();
    }
    // If no admin account has been registered
  } else {
    logger.debug("Admin account doesn't exist");
    // Check if first account is going to be of type admin
    logger.debug('Checking if the user type of the new account is admin');
    if (userType === UserTypes.Admin) {
      logger.debug('The user type of the new account is admin');
      logger.debug('Registrating first account');
      process.env.ADMIN_EXISTS = 'true';
    } else {
      logger.debug(
        'The user type supplied in body is not of type admin. It must be if type admin when registering the first account',
      );
      throw new BadRequestError(lang.firstAccMustBeAdmin);
    }
  }

  // The temp password will be emailed to the user
  const tempPassword = nanoid();
  logger.debug(
    `Creating temp password. ${
      CONFIG.dev ? `TempPassword: ${tempPassword}` : '' // This is for development. It should never be logged in production
    }`,
  );

  logger.debug('Building new user settings');
  const userSettings = UserSettings.build({
    theme: 'dark',
    language: req.lang,
    notifications: [''],
  });

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

  // Couldnt get nats mock to work
  // Code is only ran if its not test environment
  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new UserCreatedPublisher(natsWrapper.client, logger).publish({
      userId: newUser.id,
      email: newUser.email, // To send email to the user registered
      tempPassword, // Temp password to be included in email
      userType: userType,
      name: name,
      lang: newUser.settings.language,
    });

    logger.info('Sent Nats user registered event');
  }

  logger.info('User creation successful');
  res.status(201).json({
    errors: false,
    message: lang.registeredUser,
    user: newUser,
    tempPassword: CONFIG.dev ? tempPassword : undefined, // Temp password is only included in body if application is in dev mode
  });
};

export default register;
