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
} from '../../../library';
import jwt from 'jsonwebtoken';

import Admin from '../../../models/admin';
import { logger } from '../../../logger/logger';
import createAndSetCookie from '../../../utils/session/createAndSetCookie';
import { getLanguage } from '../../../middlewares/getLanguage';

const adminLoginRouter = Router();

// TODO
// Remove hardcoded text
/*
#
#
#
#           THIS CANT BE COMPLETED WITHOUT FREJAEID!!!!
#
#
#
*/

adminLoginRouter.post(
  '/api/admin/login',
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
        max: CONFIG.passwords.length.max,
      })
      .withMessage((value, { req }) => {
        const { lang } = req;

        return LANG[lang].wrongPasswordLength
          .replace('%minPasswordLength%', CONFIG.passwords.length.min)
          .replace('%maxPasswordLength%', CONFIG.passwords.length.max);
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { lang } = req;

    logger.debug('User trying to login');

    // Using admin model becuase admin login is seperated from regural user login
    const admin = await Admin.findOne({ email });
    if (!admin) {
      logger.debug('No user with the supplied email was found');
      res.status(204).send();
    } else {
      // Check if password matches the password stored in database
      if (await Password.compare(admin.password, password)) {
        logger.debug('Password was correct');
        // Create token for cookie
        const token = jwt.sign(
          { email, id: admin.id, userType: UserTypes.Admin, lang: lang },
          process.env.JWT_KEY as string,
        );

        // Create cookie and attatch it to the response object
        await createAndSetCookie(req, res, admin.id, token, lang);

        res.status(200).json({
          msg: LANG[lang].loginSuccessful,
        });
      } else {
        logger.debug('Password was incorrect');
        throw new BadRequestError(LANG[lang].wrongCredentials);
      }
    }
  },
);

export default adminLoginRouter;
