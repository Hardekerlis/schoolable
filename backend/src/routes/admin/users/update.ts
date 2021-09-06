/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError, LANG } from '../../../library';
import mongoose from 'mongoose';

import User from '../../../models/user';
import { UserTypes } from '../../../utils/userTypes.enum';

import { logger } from '../../../logger/logger';
import sendMail from '../../../utils/sendMail';

import { authenticate } from '../../../middlewares/authenticate';
import { getLanguage } from '../../../middlewares/getLanguage';
import { checkUserType } from '../../../middlewares/checkUserType';

const updateRouter = Router();

// TODO
// Remove hardcoded text

updateRouter.put(
  '/api/admin/users',
  authenticate,
  getLanguage,
  checkUserType(['admin']),
  [
    body('email')
      .exists()
      .isEmail()
      .withMessage((value, { req }) => {
        const { lang } = req;

        return LANG[lang].needValidEmail;
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
    body('id')
      .exists()
      .custom((value, { req }) => {
        // Check if id is a valid MongoDb ObjectId
        if (!mongoose.isValidObjectId(value)) {
          const { lang } = req;
          throw new BadRequestError(LANG[lang].notValidObjectId);
        } else {
          return value;
        }
      }),
    body('name')
      .exists()
      .isString()
      .withMessage((value, { req }) => {
        const { lang } = req;
        return LANG[lang].supplyUsername;
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id, email, userType, name } = req.body;
    const { lang } = req;

    // Find user document by id and update it
    const user = await User.findByIdAndUpdate(
      id,
      { email, userType, name },
      { new: true }, // To make it return the updated user, otherwise it returns the old not updated document
    );

    if (!user) {
      res.status(404).json({
        msg: LANG[lang].noUserWithId,
        suppliedId: id,
      });
    } else {
      res.status(200).json({ msg: LANG[lang].updatedUser, user });
    }
  },
);

export default updateRouter;
