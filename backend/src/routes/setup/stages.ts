/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError, LANG } from '../../library';

import User from '../../models/user';
import { authenticate, UserPayload } from '../../middlewares/authenticate';
import { getLanguage } from '../../middlewares/getLanguage';
import { checkUserType } from '../../middlewares/checkUserType';
import { logger } from '../../logger/logger';

const stagesRouter = Router();

// TODO: Add logger to stages

// The first stage is for choosing password
stagesRouter.post(
  '/api/setup/stage/1',
  authenticate,
  getLanguage,
  checkUserType(['student', 'teacher', 'external']), // Allowed usertypes
  [
    body('password')
      .exists()
      .isString()
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          throw new BadRequestError(LANG[`${req.lang}`].passwordsDontMatch);
        } else {
          return value;
        }
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // Find user by the information in auth cookie
    const user = await User.findById((req.currentUser as UserPayload).id);

    // @ts-ignore
    const lang = LANG[`${req.lang}`];

    if (!user) {
      throw new BadRequestError(lang.noUserFoundFromIdInCookie);
    }

    // If user already has gone through this stage passwordChoosen will be true
    if (user.passwordChoosen) {
      throw new BadRequestError(lang.passwordAlreadyChoosen);
    }

    const { password } = req.body;

    // Hashing happens as a middleware in mongoose. It happens automatically on save
    user.password = password as string;
    user.passwordChoosen = true;

    try {
      await user.save();
      res.status(200).json({
        errors: false,
        msg: lang.succesfullyUpdatedPassword,
        continue: true,
      });
    } catch (err) {
      logger.error(`Unexpected error. Error message: ${err}`);
      res.status(400).json({
        errors: true,
        continue: false,
      });
    }
  },
);

// The second stage is for selecting application theme
stagesRouter.post(
  '/api/setup/stage/2',
  authenticate,
  getLanguage,
  [
    body('theme')
      .exists()
      .isString()
      .custom((value, { req }) => {
        if (value !== 'dark' && value !== 'light') {
          throw new BadRequestError(LANG[`${req.lang}`].themeDoesntExist);
        } else return value;
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const user = await User.findById(
      (req.currentUser as UserPayload).id,
    ).populate('settings'); // Populate populates subdocument

    const lang = LANG[`${req.lang}`];

    // If no user found
    if (!user) {
      throw new BadRequestError(lang.noUserFound);
    }

    // If user hasn't completed the previous step
    if (!user.passwordChoosen) {
      throw new BadRequestError(lang.userHasNotChoosenPassword);
    }

    // Set the choosen theme
    user.settings.theme = req.body.theme;

    try {
      await user.settings.save();
      res.status(200).json({
        errors: false,
        msg: lang.selectedTheme,
        continue: true,
      });
    } catch (err) {
      logger.error(`Unexpected error. Error message: ${err}`);
      res.status(400).json({
        errors: true,
        continue: false,
      });
    }
  },
);

// The third stage is for selecting application language
stagesRouter.post(
  '/api/setup/stage/3',
  authenticate,
  getLanguage,
  [
    body('language')
      .exists()
      .isString()
      .custom((value, { req }) => {
        value = value.toLowerCase();
        if (value !== 'swe' && value !== 'eng') {
          throw new BadRequestError(LANG[`${req.lang}`].languageDoesntExist);
        } else return value;
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const user = await User.findById(
      (req.currentUser as UserPayload).id,
    ).populate('settings'); // Populate populates subdocument

    const lang = LANG[`${req.lang}`];

    // If no user found
    if (!user) {
      throw new BadRequestError(lang.noUserWithId);
    }

    if (!user.passwordChoosen) {
      throw new BadRequestError(lang.userHasNotChoosenPassword);
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
        msg: lang.selectedLanguage,
        finished: true, // To indicate to frontend that setup steps are completed
      });
    } catch (err) {
      logger.error(`Unexpected error. Error message: ${err}`);
      res.status(400).json({
        errors: true,
        continue: false,
      });
    }
  },
);

export default stagesRouter;
