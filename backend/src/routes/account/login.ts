/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  CONFIG,
  Password,
  BadRequestError,
  UserTypes,
} from '../../library';
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

    // Try to find user trying to login
    logger.debug('Looking up user');
    const user = await User.findOne({ email, userType });

    // No user found
    if (!user) {
      logger.debug('No user found');
      throw new BadRequestError('No user found');
    }

    // Check if password supplied by user matches the password stored in the DB
    if (await Password.compare(user.password, password)) {
      if (!user.settings) logger.info('Password was correct');
      try {
        // Create token
        logger.info('Creating token');
        const token = jwt.sign(
          {
            email: user.email,
            id: user.id,
            userType: user.userType, // Needed to see difference between account types
            name: user.name,
          },
          process.env.JWT_KEY as string,
        );

        // Assign token to jwt cookie and attach the cookie to the users session
        // req.session = {
        //   jwt: token,
        // };

        logger.info('User is authenticated');
        res.status(200).json({
          errors: false,
          msg: 'Login was successful',
          firstTime: !user.setupComplete, // This is to tell the frontend if a setup prompt should be showed
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
