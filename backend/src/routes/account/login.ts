/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  CONFIG,
  Password,
  BadRequestError,
  UserTypes,
  LANG,
} from '../../library';
import jwt from 'jsonwebtoken';

import User from '../../models/user';
import { logger } from '../../logger/logger';
import createAndSetCookie from '../../utils/session/createAndSetCookie';
import { getLanguage } from '../../middlewares/getLanguage';

const loginRouter = Router();

// TODO
// Remove hardcoded text

loginRouter.post(
  '/api/login',
  getLanguage,
  [
    body('email')
      .isEmail()
      .trim()
      .withMessage((value, { req }) => {
        const { lang } = req;

        return LANG[lang].needValidEmail;
      }), // Check if supplied email is valid
    body('password') // Check if password is valid
      .exists()
      .trim()
      .isLength({
        min: CONFIG.passwords.length.min,
        max: CONFIG.dev ? 40 : CONFIG.passwords.length.max, // Because temp password is passed when in dev mode and it's 36 chars
      })
      .withMessage((value, { req }) => {
        const { lang } = req;

        return LANG[lang].wrongPasswordLength
          .replace('%minPasswordLength%', CONFIG.passwords.length.min)
          .replace('%maxPasswordLength%', CONFIG.passwords.length.max);
      })
      .bail() // Stop the check if the password is not the required length
      .custom((value, { req }) => {
        logger.debug('Comparing password and confirmPassword');
        if (value !== req.body.confirmPassword) {
          logger.info("The passwords doesn't match");
          const { lang } = req;
          throw new Error(LANG[lang].passwordsDontMatch);
        } else {
          logger.debug('The passwords matched');
          return value;
        }
      }),
    body('userType').custom((value, { req }) => {
      // Check if the desired userType exists in the enum
      const enumUserTypes = Object.values(UserTypes);
      if (!enumUserTypes[enumUserTypes.indexOf(value)]) {
        logger.info("The specified user type doesn't exist");
        const { lang } = req;

        throw new Error(LANG[lang].theSpecifiedUserTypeDoesntExist);
      } else {
        return value;
      }
    }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, userType } = req.body;
    const { lang } = req;

    // Try to find user trying to login
    logger.debug('Looking up user');
    const user = await User.findOne({ email, userType }).populate('settings');

    // No user found
    if (!user) {
      logger.debug('No user found');

      throw new BadRequestError(LANG[lang].noUserFound);
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
            lang: user.settings.language,
          },
          process.env.JWT_KEY as string,
        );

        // Create cookie and attatch it to the response object
        await createAndSetCookie(
          req,
          res,
          user.id,
          token,
          user.settings.language,
        );

        logger.info('User is authenticated');
        res.status(200).json({
          errors: false,
          msg: LANG[lang].loginSuccessful,
          firstTime: !user.setupComplete, // This is to tell the frontend if a setup prompt should be showed
          user,
        });
      } catch (err) {
        logger.error(
          `Ran into an error when creating cookie. Error message: ${err}`,
        );
      }
    } else {
      logger.info('The supplied password was wrong');
      throw new BadRequestError(LANG[lang].wrongCredentials);
    }
  },
);

export default loginRouter;
