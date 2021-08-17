/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@schoolable/common';

import User from '../../models/user';
import UserSettings from '../../models/userSettings';
import { authenticate, UserPayload } from '../../middlewares/authenticate';
import { checkUserType } from '../../middlewares/checkUserType';
import { logger } from '../../logger/logger';

const stagesRouter = Router();

// TODO
// Remove hardcoded text

// The first stage is for choosing password
stagesRouter.post(
  '/api/setup/stage/1',
  authenticate,
  checkUserType(['student', 'teacher', 'external']), // Allowed usertypes
  [
    body('password')
      .exists()
      .isString()
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          throw new BadRequestError(
            "Password and confirm password doesn't match",
          );
        } else {
          return value;
        }
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // Find user by the information in auth cookie
    const user = await User.findById((req.currentUser as UserPayload).id);

    if (!user) {
      throw new BadRequestError(
        'No user found from the id contained in the cookie',
      );
    }

    // If user already has gone through this stage passwordChoosen will be true
    if (user.passwordChoosen) {
      throw new BadRequestError(`User has already choosen a password`);
    }

    const { password } = req.body;

    // Hashing happens as a middleware in mongoose. It happens automatically on save
    user.password = password as string;
    user.passwordChoosen = true;

    try {
      await user.save();
      res.status(200).json({
        errors: false,
        msg: 'Succesfully updated password',
        continue: true,
      });
    } catch (err) {
      logger.error(`Unexpected error. Error message: ${err}`);
      res.status(400).json({
        errors: true,
        msg: err,
        continue: false,
      });
    }
  },
);

// The second stage is for selecting application theme
stagesRouter.post(
  '/api/setup/stage/2',
  authenticate,
  [
    body('theme')
      .exists()
      .isString()
      .custom((value) => {
        if (value !== 'dark' && value !== 'light') {
          throw new BadRequestError('No theme with that name exists');
        } else return value;
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const user = await User.findById(
      (req.currentUser as UserPayload).id,
    ).populate('settings'); // Populate populates subdocument

    // If no user found
    if (!user) {
      throw new BadRequestError(
        'No user found from the id contained in the cookie',
      );
    }

    // If user hasn't completed the previous step
    if (!user.passwordChoosen) {
      throw new BadRequestError('User has not choosen a password yet');
    }

    // Set the choosen theme
    user.settings.theme = req.body.theme;

    try {
      await user.settings.save();
      res.status(200).json({
        errors: false,
        msg: 'Succesfully selected theme',
        continue: true,
      });
    } catch (err) {
      logger.error(`Unexpected error. Error message: ${err}`);
      res.status(400).json({
        errors: true,
        msg: err,
        continue: false,
      });
    }
  },
);

// The third stage is for selecting application language
stagesRouter.post(
  '/api/setup/stage/3',
  authenticate,
  [
    body('language')
      .exists()
      .isString()
      .custom((value) => {
        value = value.toLowerCase();
        if (value !== 'swe' && value !== 'eng') {
          throw new BadRequestError("The selected language doesn't exist");
        } else return value;
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const user = await User.findById(
      (req.currentUser as UserPayload).id,
    ).populate('settings'); // Populate populates subdocument

    // If no user found
    if (!user) {
      throw new BadRequestError(
        'No user found from the id contained in the cookie',
      );
    }

    if (!user.passwordChoosen) {
      throw new BadRequestError('User has not choosen a password yet');
    }

    // Set selected language for user
    user.settings.language = req.body.language;
    // The setup is completed and therefore setupComplete should be true
    user.setupComplete = true;

    try {
      await user.settings.save();
      await user.save();
      logger.info('Saving user ');
      res.status(200).json({
        errors: false,
        msg: 'Succesfully selected language',
        finished: true, // To indicate to frontend that setup steps are completed
      });
    } catch (err) {
      logger.error(`Unexpected error. Error message: ${err}`);
      res.status(400).json({
        errors: true,
        msg: err,
        continue: false,
      });
    }
  },
);

export default stagesRouter;
