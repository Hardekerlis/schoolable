/** @format */

import { Router } from 'express';

// Collection for all admin routes to keep app.ts from being cluttered
const adminRouter = Router();

import adminLoginRouter from './account/login';
import adminRegisterRouter from './account/register';

adminRouter.use(adminLoginRouter);
adminRouter.use(adminRegisterRouter);

import { authenticate } from '../../middlewares/authenticate';
import { checkUserType } from '../../middlewares/checkUserType';
// Protected routes below this line
adminRouter.use(authenticate);
adminRouter.use(checkUserType(['admin']));

import adminUsersRouter from './users/adminUsersRouter';
adminRouter.use(adminUsersRouter);

// console.log(adminUsersRouter);

export default adminRouter;
