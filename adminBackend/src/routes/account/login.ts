/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  CONFIG,
  Password,
  BadRequestError,
} from '@schoolable/common';
import jwt from 'jsonwebtoken';

import Admin from '../../models/admin';
import { logger } from '../../logger/logger';

const loginRouter = Router();

// TODO
// Remove hardcoded text
/*
#
#
#
#           THIS CANT BE COMPLETED WITHOUT FREJAEID!!!!
#
#
#
*/

loginRouter.post(
  '/api/login',
  [
    body('email')
      .isEmail()
      .trim()
      .withMessage('Please supply a valid email adress'), // Check if supplied email is valid
    body('password') // Check if password is valid
      .exists()
      .trim()
      .isLength({
        min: CONFIG.passwords.length.min,
        max: CONFIG.passwords.length.max,
      })
      .withMessage(
        `Passwords must be between ${CONFIG.passwords.length.min} and ${CONFIG.passwords.length.max} characters`,
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    logger.debug('User trying to login');

    const admin = await Admin.findOne({ email });

    if (!admin) {
      logger.debug('No user with the supplied email was found');
      res.status(204).send();
    } else {
      if (await Password.compare(admin.password, password)) {
        logger.debug('Password was correct');
        const token = jwt.sign(
          { email, id: admin.id },
          process.env.JWT_KEY as string,
        );

        req.session = {
          jwt: token,
        };

        res.status(200).json({
          msg: 'Login successful',
        });
      } else {
        logger.debug('Password was incorrect');
        throw new BadRequestError('Wrong credentials');
      }
    }
  },
);

export default loginRouter;