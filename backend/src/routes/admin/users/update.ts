/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '../../../library';
import mongoose from 'mongoose';

import User from '../../../models/user';
import { UserTypes } from '../../../utils/userTypes.enum';

import { logger } from '../../../logger/logger';
import sendMail from '../../../utils/sendMail';

import { authenticate } from '../../../middlewares/authenticate';
import { checkUserType } from '../../../middlewares/checkUserType';

const updateRouter = Router();

// TODO
// Remove hardcoded text

updateRouter.put(
  '/api/admin/users',
  authenticate,
  checkUserType(['admin']),
  [
    body('email').exists().isEmail().withMessage('Please supply a valid email'),
    body('userType').custom((value) => {
      // Check if the desired userType exists in the enum
      const enumUserTypes = Object.values(UserTypes);
      if (!enumUserTypes[enumUserTypes.indexOf(value)]) {
        logger.info("The specified user type doesn't exist");
        throw new Error("The specified user type doesn't exist");
      } else {
        return value;
      }
    }),
    body('id')
      .exists()
      .custom((value) => {
        // Check if id is a valid MongoDb ObjectId
        if (!mongoose.isValidObjectId(value)) {
          throw new BadRequestError('The id supplied is not a valid ObjectId');
        } else {
          return value;
        }
      }),
    body('name').exists().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id, email, userType, name } = req.body;

    // Find user document by id and update it
    const user = await User.findByIdAndUpdate(
      id,
      { email, userType, name },
      { new: true }, // To make it return the updated user, otherwise it returns the old not updated document
    );

    if (!user) {
      res.status(404).json({
        msg: `No user with id "${id}" was found`,
      });
    } else {
      res.status(200).json({ msg: 'Successfully updated user', user });
    }
  },
);

export default updateRouter;
