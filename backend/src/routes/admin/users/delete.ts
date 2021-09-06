/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError, LANG } from '../../../library';
import mongoose from 'mongoose';

import User from '../../../models/user';
import { logger } from '../../../logger/logger';

import { authenticate } from '../../../middlewares/authenticate';
import { getLanguage } from '../../../middlewares/getLanguage';
import { checkUserType } from '../../../middlewares/checkUserType';

const deleteRouter = Router();

// TODO
// Remove hardcoded text

deleteRouter.delete(
  '/api/admin/users',
  authenticate,
  getLanguage,
  checkUserType(['admin']),
  [
    body('id')
      .exists()
      .custom((value, { req }) => {
        // Check if the supplied id is a MongoDb ObjectId
        if (!mongoose.isValidObjectId(value)) {
          const { lang } = req;
          throw new BadRequestError(LANG[lang].notValidObjectId);
        } else {
          return value;
        }
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.body;
    const { lang } = req;

    // Find user by id and delete the document
    const user = await User.findByIdAndDelete(id);

    logger.info(`Deleting account with id ${id}`);

    if (!user) {
      throw new BadRequestError(LANG[lang].noUserFound);
    }

    res.status(200).json({
      msg: LANG[lang].deletedUser,
      user,
    });
  },
);

export default deleteRouter;
