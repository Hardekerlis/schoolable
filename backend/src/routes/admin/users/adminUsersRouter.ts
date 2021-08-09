/** @format */

import { Router } from 'express';

// Collection for all admin routes to keep app.ts from being cluttered
const adminUsersRouter = Router();

import deleteRouter from './delete';
import fetchUsersRouter from './fetchUsers';
import registerRouter from './register';
import updateRouter from './update';

adminUsersRouter.use(deleteRouter);
adminUsersRouter.use(fetchUsersRouter);
adminUsersRouter.use(registerRouter);
adminUsersRouter.use(updateRouter);

export default adminUsersRouter;
