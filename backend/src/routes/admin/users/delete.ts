/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@schoolable/common';
import mongoose from 'mongoose';

import User from '../../../models/user';

import { logger } from '../../../logger/logger';

const deleteRouter = Router();

// TODO
// Remove hardcoded text

deleteRouter.delete(
  '/api/admin/users',
  [
    body('id')
      .exists()
      .custom((value) => {
        // Check if the supplied id is a MongoDb ObjectId
        if (!mongoose.isValidObjectId(value)) {
          throw new BadRequestError('The id supplied is not a valid ObjectId');
        } else {
          return value;
        }
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.body;

    // Find user by id and delete the document
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
