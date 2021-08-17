/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError, CONFIG } from '@schoolable/common';
import { v4 as uuidv4 } from 'uuid';

import User from '../../../models/user';
import UserSettings, { UserSettingsDoc } from '../../../models/userSettings';
import { UserTypes } from '../../../utils/userTypes.enum';

import { logger } from '../../../logger/logger';
import sendMail from '../../../utils/sendMail';

import { authenticate } from '../../../middlewares/authenticate';
import { checkUserType } from '../../../middlewares/checkUserType';

const registerRouter = Router();

// TODO
// Remove hardcoded text

registerRouter.post(
  '/api/admin/users/register',
  authenticate,
  checkUserType(['admin']),
  [
    body('email').exists().isEmail().withMessage('Please supply a valid email'),
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
    body('name').exists().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, name, userType, classes } = req.body;

    // Check if user witht the supplied email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    // Temp password is mailed to user email as plaintext.
    // After first login the user is prompted to choose a password
    let tempPassword = uuidv4();
    logger.debug(
      `Creating a temporary password for new user ${
        CONFIG.dev ? tempPassword : ''
      }`,
    );

    // Settings for users
    // Subdocument of users
    const settings = UserSettings.build({
      notifications: [''],
      theme: 'dark',
      language: 'SWE',
    });

    try {
      await settings.save();
    } catch (err) {
      logger.error(
        `Unexpected error. Please send the following error to the devs: ${err}`,
      );
    }

    logger.debug('Building new user');

    const user = User.build({
      email: email as string,
      name: name as string,
      userType: userType as UserTypes,
      password: tempPassword as string,
      courses: [] as Array<string>,
      settings: settings as UserSettingsDoc,
      classes: classes as Array<string>,
    });

    try {
      logger.debug('Saving new user');
      await user.save();
      user.password = ''; // Just a safe guard to stop password from being sent to frontend
    } catch (err) {
      logger.error(
        `Unexpected error. Please send the following error to the devs: ${err}`,
      );
    }

    await sendMail(
      email,
      'Temporary password',
      `<p>Temporary password: ${tempPassword}<p>`,
    );

    res.status(201).json({
      msg: `Succesfully created a ${userType} account`,
      tempPassword: CONFIG.dev ? tempPassword : undefined, // Is needed for testing in some cases. Should never be sent in prod env
      user,
    });
  },
);

export default registerRouter;
