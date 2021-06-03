/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

const router = Router();

import { Admin } from '../models/admin';

import { validateRequest } from '../lib/middlewares';
import { BadRequestError } from '../lib/errors';

router.post(
  '/api/setup/adminAccount',
  [
    body('email').isEmail().withMessage('Email must be defined'),
    body('name').isObject().exists().withMessage('You must enter your name'),
    body('publicRsaKey').exists().withMessage('Please supply a RSA key'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, name, publicRsaKey } = req.body;

    const alreadyExists = await Admin.findOne({ email });

    console.log('alreadyExists');

    if (!alreadyExists) {
      throw new BadRequestError('The email is already in use');
    }
  },
);

export { router as firstAdminAccountRouter };
