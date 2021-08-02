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
import UserSettings from '../../models/userSettings';
import { authenticate, UserPayload } from '../../middlewares/authenticate';
import { logger } from '../../logger/logger';

const stagesRouter = Router();

// TODO
// Remove hardcoded text

// The first stage is for choosing password
stagesRouter.post(
  '/api/setup/stage/1',
  authenticate,
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
    const currentUser = req.currentUser as UserPayload;
    const user = await User.findById(currentUser.id);

    if (!user) {
      throw new BadRequestError(
        'No user found from the id contained in the cookie',
      );
    }

    if (user.passwordChoosen) {
      throw new BadRequestError(`User has already choosen a password`);
    }

    const { password } = req.body;

    user.password = password as string;
    user.passwordChoosen = true;

    try {
      await user.save();
      res.status(200).json({
        error: false,
        msg: 'Succesfully updated password',
        continue: true,
      });
    } catch (err) {
      logger.error(`Unexpected error. Error message: ${err}`);
      res.status(400).json({
        error: true,
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
    const currentUser = req.currentUser as UserPayload;
    await UserSettings.findOne({}); // Doesn't register model w/o
    const user = await User.findById(currentUser.id).populate('settings');
    if (!user) {
      throw new BadRequestError(
        'No user found from the id contained in the cookie',
      );
    }

    if (!user.passwordChoosen) {
      throw new BadRequestError('User has not choosen a password yet');
    }

    user.settings.theme = req.body.theme;

    try {
      await user.settings.save();
      res.status(200).json({
        error: false,
        msg: 'Succesfully selected theme',
        continue: true,
      });
    } catch (err) {
      logger.error(`Unexpected error. Error message: ${err}`);
      res.status(400).json({
        error: true,
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
        if (value !== 'swe' && value !== 'eng') {
          throw new BadRequestError("The selected language doesn't exist");
        } else return value;
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser as UserPayload;
    try {
      const user = await User.findById(currentUser.id).populate('settings');
      if (!user) {
        throw new BadRequestError(
          'No user found from the id contained in the cookie',
        );
      }

      if (!user.passwordChoosen) {
        throw new BadRequestError('User has not choosen a password yet');
      }

      user.settings.language = req.body.language;

      try {
        console.log('err');
        await user.settings.save();
        res.status(200).json({
          error: false,
          msg: 'Succesfully selected language',
          continue: true,
        });
      } catch (err) {
        logger.error(`Unexpected error. Error message: ${err}`);
        res.status(400).json({
          error: true,
          msg: err,
          continue: false,
        });
      }
    } catch (err) {
      console.error(err);
      res.send();
    }
  },
);
// Ace test
export default stagesRouter;
