/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@schoolable/common';
import mongoose from 'mongoose';

import User from '../../models/user';

import { logger } from '../../logger/logger';
import { authenticate } from '../../middlewares/authenticate';

const deleteRouter = Router();

// TODO
// Remove hardcoded text

deleteRouter.delete(
  '/api/users',
  authenticate,
  [
    body('email').isEmail().withMessage('Please supply a valid email adress'),
    body('id')
      .exists()
      .custom((value, { req }) => {
        if (!mongoose.isValidObjectId(value)) {
          throw new BadRequestError('The id supplied is not a valid ObjectId');
        } else {
          return value;
        }
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, id } = req.body;

    const user = await User.findByIdAndDelete(id);

    logger.info(`Deleting account with id ${id}`);

    if (!user) {
      throw new BadRequestError('No user found');
    }

    res.status(200).json({
      msg: 'Successfully deleted user',
      user,
    });
  },
);

export default deleteRouter;
