import { Request, Response } from 'express';
import {
  NotAuthorizedError,
  LANG,
  UserTypes,
  CONFIG,
  BadRequestError,
} from '@gustafdahl/schoolable-common';

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

  logger.debug('Checking if the supplied email is in use');
  const isEmailInUse = !!(await User.findOne({ email }));

  if (isEmailInUse) {
    logger.debug('Email is in use');
    throw new BadRequestError(lang.emailInUse);
  }
  logger.debug('Email is not in use');

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
  });
};

export default register;
