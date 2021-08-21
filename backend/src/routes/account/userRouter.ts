/** @format */

import { Router } from 'express';

const userRouter = Router();

import login from './login';
userRouter.use(login);

import logout from './logout';
userRouter.use(logout);

export default userRouter;
