/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, CONFIG, UserTypes, LANG } from '../../../library';
import jwt from 'jsonwebtoken';

import Admin from '../../../models/admin';

import { logger } from '../../../logger/logger';
import createAndSetCookie from '../../../utils/session/createAndSetCookie';
import { getLanguage } from '../../../middlewares/getLanguage';

const registerAdminRouter = Router();

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

registerAdminRouter.post(
  '/api/admin/register',
  getLanguage,
  [
    body('email')
      .custom(async (value, { req }) => {
        // Check if supplied email is already taken
        const existingUser = await Admin.findOne({ email: req.body.email });

        logger.debug(
          'Checking if admin user with supplied email already exists',
        );

        if (existingUser) {
          const { lang } = req;
          logger.info('User with the supplied email already exists');
          throw new Error(LANG[lang].userWithSuppliedEmailExists);
        } else {
          logger.debug("User with the supplied email doesn't exist");
          return value;
        }
      })
      .bail()
      .isEmail()
      .trim()
      .withMessage((value, { req }) => {
        const { lang } = req;
        return LANG[lang].needValidEmail;
      }), // Check if supplied email is valid
    body('name').exists().isString(),
    body('password') // Check if password is valid
      .exists()
      .withMessage('Please supply a password')
      .bail()
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
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    const { lang } = req;

    const firstAdminCreated = await Admin.find({});

    const admin = Admin.build({
      email: email as string,
      name: name as string,
      password: password as string,
      verified: false,
    });

    // Verified is only set to true for the first admin account
    // The other admins will recieve and email with a verification link
    // They then verify their account with FrejaEID
    if (!firstAdminCreated[0]) {
      logger.info('Registered the first admin account');
      admin.verified = true;

      try {
        const token = jwt.sign(
          {
            email,
            id: admin.id,
            userType: UserTypes.Admin,
            lang: lang,
          },
          process.env.JWT_KEY as string,
        );

        // Create cookie and attatch it to the response object
        await createAndSetCookie(req, res, admin.id, token, lang);
      } catch (err) {
        logger.error(
          `Ran into error when creating auth token. Error message: ${err}`,
        );
      }
    }

    logger.info('Attempting to save admin user');
    await admin.save();
    logger.info('Succesfully saved admin user');

    res.status(201).json({
      msg: LANG[lang].registeredAdmin,
      verified: admin.verified,
    });
  },
);

export default registerAdminRouter;
