/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@schoolable/common';
import { v4 as uuidv4 } from 'uuid';

import User from '../../models/user';
import { UserTypes } from '../../utils/userTypes.enum';

import { logger } from '../../logger/logger';
import sendMail from '../../utils/sendMail';
import { authenticate } from '../../middlewares/authenticate';

const registerRouter = Router();

// TODO
// Remove hardcoded text

registerRouter.post(
  '/api/users/register',
  authenticate,
  [
    body('email').exists().isEmail().withMessage('Please supply a valid email'),
    body('userType').custom(async (value, { req }) => {
      const { userType } = req.body;

      // Check if the desired userType exists in the enum
      const enumUserTypes = Object.values(UserTypes);
      if (!enumUserTypes[enumUserTypes.indexOf(userType)]) {
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
    const { email, name, userType } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    let tempPassword = uuidv4();

    const user = User.build({
      email: email as string,
      name: name as string,
      userType: userType as UserTypes,
      password: tempPassword as string,
      courses: [] as Array<string>,
    });

    try {
      await user.save();
      user.password = '';
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
      user,
    });
  },
);

export default registerRouter;
