/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  CONFIG,
  Password,
  BadRequestError,
  UserTypes,
} from '@schoolable/common';
import jwt from 'jsonwebtoken';

import User from '../../models/user';
import { logger } from '../../logger/logger';

const loginRouter = Router();

// TODO
// Remove hardcoded text

loginRouter.post(
  '/api/login',
  [
    body('email')
      .isEmail()
      .trim()
      .withMessage('Please supply a valid email adress'), // Check if supplied email is valid
    body('password') // Check if password is valid
      .exists()
      .trim()
      .isLength({
        min: CONFIG.passwords.length.min,
        max: CONFIG.dev ? 40 : CONFIG.passwords.length.max, // Because temp password is passed when in dev mode and it's 36 chars
      })
      .withMessage(
        `Passwords must be between ${CONFIG.passwords.length.min} and ${CONFIG.passwords.length.max} characters`,
      ),
    body('userType').custom(async (value) => {
      // Check if the desired userType exists in the enum
      const enumUserTypes = Object.values(UserTypes);
      if (!enumUserTypes[enumUserTypes.indexOf(value)]) {
        logger.info("The specified user type doesn't exist");
        throw new Error("The specified user type doesn't exist");
      } else {
        return value;
      }
    }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, userType } = req.body;

    logger.debug('Looking up user');
    const user = await User.findOne({ email, userType });

    if (!user) {
      logger.debug('No user found');
      throw new BadRequestError('No user found');
    }

    if (await Password.compare(user.password, password)) {
      if (!user.settings) logger.info('Password was correct');
      try {
        logger.info('Creating token');
        const token = jwt.sign(
          {
            email: user.email,
            id: user.id,
            userType: user.userType,
            name: user.name,
          },
          process.env.JWT_KEY as string,
        );

        req.session = {
          jwt: token,
        };

        logger.info('User is authenticated');
        res.status(200).json({
          msg: 'Login was successful',
          err: false,
        });
      } catch (err) {
        logger.error(
          `Ran into an error when creating cookie. Error message: ${err}`,
        );
      }
    } else {
      logger.info('The supplied password was wrong');
      throw new BadRequestError('Wrong password');
    }
  },
);

export default loginRouter;
