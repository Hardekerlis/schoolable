/** @format */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest } from '../../lib/middlewares/validate-request';

const registerRouter = Router();

registerRouter.post(
  '/api/users/admin/register',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    // body('confirmPassword')
    //   .exists()
    //   .trim()
    //   .matches('password')
    //   .withMessage('Not correct'),
    // body('password')
    // .trim()
    // .isLength({ min: 5, max: 20 })
    // .withMessage('Please supply a valid password')
    // .bail()
    // .matches('confirmPassword'),
    // body('confirmPassword')
    //   .trim()
    //   .matches('password')
    //   .withMessage("The passwords doesn't match"),
  ],
  validateRequest,
  (req: Request, res: Response) => {
    const data = req.body;

    res.json({});
  },
);

export default registerRouter;
